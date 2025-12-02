import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import http from 'http';
import multer from 'multer';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

console.log('Starting server with NODE_ENV:', process.env.NODE_ENV);
console.log('Using PORT:', process.env.PORT);
console.log('DB connection string:', process.env.DB_CONNECTION ? 'Set' : 'Not set');

const isProduction = process.env.NODE_ENV === 'production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');

// Cloudinary storage configuration
const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary.v2,
        params: {
            folder: `shutterverse/${folderName}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 800, crop: 'limit' }],
            resource_type: 'image'
        }
    });
};

// Create upload middlewares for different types
const upload = multer({ storage: createCloudinaryStorage('news') });
const studioUpload = multer({ storage: createCloudinaryStorage('studios') });
const teamUpload = multer({ storage: createCloudinaryStorage('team') });

// Helper function to delete images from Cloudinary
const deleteCloudinaryImage = async (publicId) => {
    try {
        if (!publicId) return null;
        const result = await cloudinary.v2.uploader.destroy(publicId);
        console.log('Deleted image from Cloudinary:', publicId, result);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return null;
    }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567/shutterverse/news/filename.jpg
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1) {
            // Get everything after 'upload' (excluding version if present)
            const pathAfterUpload = parts.slice(uploadIndex + 1).join('/');
            // Remove file extension
            return pathAfterUpload.replace(/\.[^/.]+$/, "");
        }
    } catch (error) {
        console.error('Error extracting public_id from URL:', url, error);
    }
    return null;
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: isProduction
        ? ['https://shutterverse.onrender.com']
        : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const client = new MongoClient(process.env.DB_CONNECTION, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

let db, newsCollection, studioCollection, userCollection, teamCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("Shutterverse");
        newsCollection = db.collection("News");
        studioCollection = db.collection("Studios");
        userCollection = db.collection("Users");
        teamCollection = db.collection("Team");
        console.log("Connection to DB successful");
    } catch (err) {
        console.error("Error during DB connection: " + err);
    }
}

wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
    });
});

connectDB().then(() => {
    server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
        console.log(`Server running on port ${process.env.PORT || 3000} (HTTP & WebSocket)`);
    });
}).catch(err => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
});

function broadcastNewsUpdate(type, data) {
    const message = JSON.stringify({
        type,
        data
    });

    clients.forEach(client => {
        try {
            if (client.readyState === 1) {
                client.send(message);
                console.log(`Broadcasted ${type} message:`, data);
            }
        } catch (err) {
            console.error('Error sending WebSocket message:', err);
            clients.delete(client);
        }
    });
}

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

// Upload endpoints - now using Cloudinary
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('Uploaded to Cloudinary:', req.file.path);
    res.json({
        imagePath: req.file.path, // Cloudinary URL
        publicId: req.file.filename // Cloudinary public_id
    });
});

app.post('/api/upload/studio', studioUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('Uploaded studio image to Cloudinary:', req.file.path);
    res.json({
        imagePath: req.file.path,
        publicId: req.file.filename
    });
});

app.post('/api/upload/team', teamUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('Uploaded team image to Cloudinary:', req.file.path);
    res.json({
        imagePath: req.file.path,
        publicId: req.file.filename
    });
});

app.get('/api/news', async (req, res) => {
    try {
        const news = await newsCollection.find().toArray();
        res.json({ news });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/news/:id', async (req, res) => {
    try {
        const newsItem = await newsCollection.findOne({ id: parseInt(req.params.id) });
        if (!newsItem) return res.status(404).json({ error: 'News item not found' });
        res.json(newsItem);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/news', async (req, res) => {
    const { day, month, title, text, image, year, publicId } = req.body;
    if (!day || !month || !title || !text || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const lastItem = await newsCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastItem.length > 0 ? lastItem[0].id + 1 : 1;

        const newItem = {
            id: newId,
            day,
            month,
            title,
            text,
            image: image || null,
            publicId: publicId || null, // Store Cloudinary public_id
            year
        };
        await newsCollection.insertOne(newItem);
        broadcastNewsUpdate('create', newItem);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/news/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { day, month, title, text, image, year, publicId } = req.body;

    if (!day || !month || !title || !text || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Get existing news item to check for old image
        const existingNews = await newsCollection.findOne({ id });
        if (!existingNews) {
            return res.status(404).json({ error: 'News item not found' });
        }

        // Delete old image from Cloudinary if new image is provided
        if (image && existingNews.image && existingNews.image !== image) {
            const oldPublicId = existingNews.publicId || extractPublicId(existingNews.image);
            if (oldPublicId) {
                await deleteCloudinaryImage(oldPublicId);
            }
        }

        const result = await newsCollection.updateOne(
            { id },
            { $set: { day, month, title, text, image, publicId, year } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }
        broadcastNewsUpdate('update', { id, day, month, title, text, image, publicId, year });
        res.json({ id, day, month, title, text, year });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        // Get the news item first
        const newsItem = await newsCollection.findOne({ id: parseInt(req.params.id) });
        if (!newsItem) {
            return res.status(404).json({ error: 'News item not found' });
        }

        // Delete image from Cloudinary if it exists
        if (newsItem.image) {
            const publicId = newsItem.publicId || extractPublicId(newsItem.image);
            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        const result = await newsCollection.deleteOne({ id: parseInt(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }
        broadcastNewsUpdate('delete', parseInt(req.params.id));
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/studios', async (req, res) => {
    try {
        const studios = await studioCollection.find().toArray();
        res.json({ studios });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/studios/:id', async (req, res) => {
    try {
        const studio = await studioCollection.findOne({ id: req.params.id });
        if (!studio) return res.status(404).json({ error: 'Studio not found' });
        res.json(studio);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/studios', async (req, res) => {
    const { image, title, details, booking, publicId } = req.body;

    if (!image || !title || !details || !details.name || !details.description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: image, title, details.name, details.description'
        });
    }

    try {
        const studios = await studioCollection.find().toArray();
        const maxId = studios.reduce((max, studio) => {
            const idNum = parseInt(studio.id.split('-')[1]);
            return idNum > max ? idNum : max;
        }, 0);

        const newStudio = {
            id: `studio-${maxId + 1}`,
            image,
            title,
            booking: booking || null,
            details: {
                name: details.name,
                description: details.description,
                features: details.features || null
            },
            publicId: publicId || null
        };

        await studioCollection.insertOne(newStudio);
        res.status(201).json(newStudio);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/studios/:id', async (req, res) => {
    const { image, title, details, booking, publicId } = req.body;

    if (!image || !title || !details || !details.name || !details.description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: image, title, details.name, details.description'
        });
    }

    try {
        // Get existing studio to check for old image
        const existingStudio = await studioCollection.findOne({ id: req.params.id });
        if (!existingStudio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Delete old image from Cloudinary if new image is provided
        if (image && existingStudio.image && existingStudio.image !== image) {
            const oldPublicId = existingStudio.publicId || extractPublicId(existingStudio.image);
            if (oldPublicId) {
                await deleteCloudinaryImage(oldPublicId);
            }
        }

        const result = await studioCollection.updateOne(
            { id: req.params.id },
            {
                $set: {
                    image,
                    title,
                    booking: booking || null,
                    details: {
                        name: details.name,
                        description: details.description,
                        features: details.features || null
                    },
                    publicId: publicId || null
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        const updatedStudio = await studioCollection.findOne({ id: req.params.id });
        res.json(updatedStudio);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/studios/:id', async (req, res) => {
    try {
        // Get the studio first
        const studio = await studioCollection.findOne({ id: req.params.id });
        if (!studio) {
            return res.status(404).json({ error: 'Studio not found' });
        }

        // Delete image from Cloudinary if it exists
        if (studio.image) {
            const publicId = studio.publicId || extractPublicId(studio.image);
            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        const result = await studioCollection.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Studio not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await userCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            success: true,
            role: user.role,
            userId: user._id
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await userCollection.find({}, { projection: { password: 0 } }).toArray();
        const usersWithStringIds = users.map(user => ({
            ...user,
            _id: user._id.toString()
        }));
        res.json(usersWithStringIds);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/users', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = {
            email,
            password: 'Password1234',
            role: 'user',
            name: name || ''
        };

        const result = await userCollection.insertOne(newUser);
        const createdUser = {
            _id: result.insertedId,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        };
        res.status(201).json(createdUser);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/users/:id/reset-password', async (req, res) => {
    const id = req.params.id;
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                error: 'Invalid user ID format',
                message: 'ID must be a 24-character hex string'
            });
        }
        const objectId = new ObjectId(id);
        const result = await userCollection.updateOne(
            { _id: objectId },
            { $set: { password: 'Password1234' } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true });
    } catch (err) {
        if (err.name === 'BSONError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/users/:id/toggle-admin', async (req, res) => {
    const id = req.params.id;

    try {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newRole = user.role === 'admin' ? 'user' : 'admin';

        await userCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { role: newRole } }
        );

        res.json({ success: true, newRole });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const result = await userCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/team-members', async (req, res) => {
    try {
        const teamMembers = await teamCollection.find().toArray();
        res.json({ teamMembers });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/team-members/:id', async (req, res) => {
    try {
        const teamMember = await teamCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!teamMember) return res.status(404).json({ error: 'Team member not found' });
        res.json(teamMember);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/team-members', async (req, res) => {
    const { teamNo, Name, Occupation, Description, SocialMedia, Image, publicId } = req.body;

    if (!teamNo || !Name || !Occupation || !Description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: teamNo, Name, Occupation, Description'
        });
    }

    try {
        const newMember = {
            teamNo,
            Name,
            Occupation,
            Description,
            SocialMedia: SocialMedia || {},
            Image: Image || null,
            publicId: publicId || null
        };

        const result = await teamCollection.insertOne(newMember);
        res.status(201).json({ ...newMember, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/team-members/:id', async (req, res) => {
    const id = req.params.id;
    const { teamNo, Name, Occupation, Description, SocialMedia, Image, publicId } = req.body;

    if (!teamNo || !Name || !Occupation || !Description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: teamNo, Name, Occupation, Description'
        });
    }

    try {
        const objectId = new ObjectId(id);

        // Get existing team member to check for old image
        const existingMember = await teamCollection.findOne({ _id: objectId });
        if (!existingMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        // Delete old image from Cloudinary if new image is provided
        if (Image && existingMember.Image && existingMember.Image !== Image) {
            const oldPublicId = existingMember.publicId || extractPublicId(existingMember.Image);
            if (oldPublicId) {
                await deleteCloudinaryImage(oldPublicId);
            }
        }

        const result = await teamCollection.updateOne(
            { _id: objectId },
            {
                $set: {
                    teamNo,
                    Name,
                    Occupation,
                    Description,
                    SocialMedia: SocialMedia || {},
                    Image: Image || null,
                    publicId: publicId || null
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const updatedMember = await teamCollection.findOne({ _id: objectId });
        res.json(updatedMember);
    } catch (err) {
        if (err.name === 'BSONError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/team-members/:id', async (req, res) => {
    try {
        // Get the team member first
        const teamMember = await teamCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!teamMember) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        // Delete image from Cloudinary if it exists
        if (teamMember.Image) {
            const publicId = teamMember.publicId || extractPublicId(teamMember.Image);
            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        const result = await teamCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// REMOVED static file serving for local images since we're using Cloudinary
// Remove these lines:
// app.use('/assets/images/news', ...)
// app.use('/assets/images/studios', ...)
// app.use('/assets/images/team', ...)

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

if (isProduction) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

export default app;