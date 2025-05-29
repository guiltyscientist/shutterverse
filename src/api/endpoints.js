import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/assets', express.static('public/assets'));
app.use(cookieParser());
app.use(cors());

let news = [
    {
        id: 1,
        day: "27",
        month: "APRIL",
        title: "New Studio – <strong>EASTER</strong> theme starts on the 27th of April",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 2,
        day: "27",
        month: "APRIL",
        title: "New Studio – <strong>EASTER</strong> theme starts on the 27th of April",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 3,
        day: "03",
        month: "MARCH",
        title: "New Studio – <strong>RETRO</strong> theme starts on the 3rd of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 4,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 5,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 6,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 7,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 8,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 9,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 10,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 12,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 13,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 14,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 15,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
    {
        id: 16,
        day: "12",
        month: "MARCH",
        title: "New Studio – <strong>SPRING</strong> theme starts on the 12th of March",
        text: "Prepare yourself with a fitting Cosplay and book your slots"
    },
];

let studios = [
    {
        id: "studio-1",
        image: "src/assets/studios/IMG_7028.JPG",
        title: "Studio_1",
        details: {
            title: "EASTER STUDIO",
            description: `Step into our spring-themed wonderland...`,
        },
    },
    {
        id: "studio-2",
        image: "src/assets/studios/IMG_7411.JPG",
        title: "Studio_2",
        details: {
            title: "EASTER STUDIO",
            description: `Step into our spring-themed wonderland...`,
        },
    },
];

app.get('/api/news', (req, res) => {
    res.json({ news });
});

app.get('/api/news/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newsItem = news.find(item => item.id === id);

    if (!newsItem) {
        return res.status(404).json({ error: 'News item not found' });
    }

    res.json(newsItem);
});

app.get('/api/studios', (req, res) => {
    res.json({ studios });
});

app.get('/api/studios/:id', (req, res) => {
    const studioItem = studios.find(item => item.id === req.params.id);

    if (!studioItem) {
        return res.status(404).json({ error: 'Studio item not found' });
    }

    res.json(studioItem);
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


/* The following methods are implemented in advance for the future admin area of the website */

app.post('/api/news', (req, res) => {
    const { day, month, title, text } = req.body;
    if (!day || !month || !title || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const maxId = news.length > 0 ? Math.max(...news.map(item => item.id)) : 0;
    const newItem = {
        id: maxId + 1,
        day,
        month,
        title,
        text
    };
    news.push(newItem);
    res.status(201).json(newItem);
});

app.put('/api/news/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    const { day, month, title, text } = req.body;
    if (!day || !month || !title || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const index = news.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'News item not found' });
    }
    news[index] = { id, day, month, title, text };
    res.json(news[index]);
});

app.delete('/api/news/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    const index = news.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'News item not found' });
    }
    news.splice(index, 1);
    res.status(204).end();
});

app.post('/api/studios', (req, res) => {
    const { image, title, details } = req.body;
    if (!image || !title || !details) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const studioIds = studios.map(studio => parseInt(studio.id.split('-')[1]));
    const maxId = studioIds.length > 0 ? Math.max(...studioIds) : 0;
    const newStudio = {
        id: `studio-${maxId + 1}`,
        image,
        title,
        details
    };
    studios.push(newStudio);
    res.status(201).json(newStudio);
});

app.put('/api/studios/:id', (req, res) => {
    const { id } = req.params;
    const { image, title, details } = req.body;
    if (!image || !title || !details) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const index = studios.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Studio not found' });
    }
    studios[index] = { id, image, title, details };
    res.json(studios[index]);
});

app.delete('/api/studios/:id', (req, res) => {
    const { id } = req.params;
    const index = studios.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Studio not found' });
    }
    studios.splice(index, 1);
    res.status(204).end();
});

// Authentication Endpoints
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Authentication logic
    res.json({ success: true, token: 'jwt-sample-token' });
});

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    // Registration logic
    res.status(201).json({ success: true });
});

export default app;