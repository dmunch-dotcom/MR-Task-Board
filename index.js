const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(express.static(__dirname)); // Serve files from the current directory (where index.html lives)
app.use(express.json());

// GET: Load boards/tasks
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Read error:', err);
            return res.status(500).json({ error: "Failed to read data" });
        }
        try {
            res.json(JSON.parse(data || '[]'));
        } catch (parseErr) {
            res.json([]);
        }
    });
});

// POST: Save full boards state
app.post('/api/data', (req, res) => {
    const boardsData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(boardsData, null, 2), (writeErr) => {
        if (writeErr) {
            console.error('Write error:', writeErr);
            return res.status(500).json({ error: "Failed to save data" });
        }
        res.json({ message: "Data saved successfully!" });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/index.html in your browser`);
});