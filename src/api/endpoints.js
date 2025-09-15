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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
    '/assets/images/news',
    express.static(path.join(__dirname, 'assets/images/news'))
);
app.use(
    '/assets/images/studios',
    express.static(path.join(__dirname, 'assets/images/studios'))
);
app.use(
    '/assets/images/team',
    express.static(path.join(__dirname, 'assets/images/team'))
);
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

    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
  }

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'assets/images/news');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const studioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'assets/images/studios');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const teamStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'assets/images/team');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage });
const studioUpload = multer({ storage: studioStorage });
const teamUpload = multer({ storage: teamStorage });

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `assets/images/news/${req.file.filename}`;
    res.json({ imagePath: relativePath });
});

app.post('/api/upload/studio', studioUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `assets/images/studios/${req.file.filename}`;
    res.json({ imagePath: relativePath });
});

app.post('/api/upload/team', teamUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `assets/images/team/${req.file.filename}`;
    res.json({ imagePath: relativePath });
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
    const { day, month, title, text, image, year } = req.body;
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
    const { day, month, title, text, image, year } = req.body;

    if (!day || !month || !title || !text || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await newsCollection.updateOne(
            { id },
            { $set: { day, month, title, text, image, year } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }
        broadcastNewsUpdate('update', { id, day, month, title, text, image, year });
        res.json({ id, day, month, title, text, year });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
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
    const { image, title, details, booking } = req.body;

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
            }
        };

        await studioCollection.insertOne(newStudio);
        res.status(201).json(newStudio);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/studios/:id', async (req, res) => {
    const { image, title, details, booking } = req.body;

    if (!image || !title || !details || !details.name || !details.description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: image, title, details.name, details.description'
        });
    }

    try {
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
                    }
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
    const { teamNo, Name, Occupation, Description, SocialMedia, Image } = req.body;

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
            Image: Image || null
        };

        const result = await teamCollection.insertOne(newMember);
        res.status(201).json({ ...newMember, _id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/team-members/:id', async (req, res) => {
    const id = req.params.id;
    const { teamNo, Name, Occupation, Description, SocialMedia, Image } = req.body;

    if (!teamNo || !Name || !Occupation || !Description) {
        return res.status(400).json({
            error: 'Missing required fields. Needs: teamNo, Name, Occupation, Description'
        });
    }

    try {
        const objectId = new ObjectId(id);

        const result = await teamCollection.updateOne(
            { _id: objectId },
            {
                $set: {
                    teamNo,
                    Name,
                    Occupation,
                    Description,
                    SocialMedia: SocialMedia || {},
                    Image: Image || null
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
        const result = await teamCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default app;