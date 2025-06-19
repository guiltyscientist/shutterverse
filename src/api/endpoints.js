import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const clients = new Set();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/assets', express.static('public/assets'));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const client = new MongoClient(process.env.DB_CONNECTION, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

let db, newsCollection, studioCollection, userCollection;

async function connectDB() {
    try {
        await client.connect();
        db =  client.db("Shutterverse");
        newsCollection = db.collection("News");
        studioCollection = db.collection("Studios");
        userCollection = db.collection("Users");
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
    server.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT} (HTTP & WebSocket)`);
    });
});

function broadcastNewsUpdate(type, data) {
    const message = JSON.stringify({
        type,
        data
    });

    clients.forEach(client => {
        try {
            if (client.readyState === 1) { // OPEN state
                client.send(message);
                console.log(`Broadcasted ${type} message:`, data); // Add for debugging
            }
        } catch (err) {
            console.error('Error sending WebSocket message:', err);
            clients.delete(client);
        }
    });
}
  

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
    const { day, month, title, text } = req.body;
    if (!day || !month || !title || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const lastItem = await newsCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastItem.length > 0 ? lastItem[0].id + 1 : 1;

        const newItem = { id: newId, day, month, title, text };
        await newsCollection.insertOne(newItem);
        broadcastNewsUpdate('create', newItem);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/news/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { day, month, title, text } = req.body;

    if (!day || !month || !title || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await newsCollection.updateOne(
            { id },
            { $set: { day, month, title, text } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'News item not found' });
        }
        broadcastNewsUpdate('update', { id, day, month, title, text });
        res.json({ id, day, month, title, text });
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
    const { image, title, details } = req.body;
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
            details: {
                name: details.name,
                description: details.description
            }
        };

        await studioCollection.insertOne(newStudio);
        res.status(201).json(newStudio);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/studios/:id', async (req, res) => {
    const { image, title, details } = req.body;
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
                    details: {
                        name: details.name,
                        description: details.description
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

export default app;