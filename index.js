require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./db');
const Board = require('./models/Board');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname)); // Serve files from the current directory (where index.html lives)
app.use(express.json());

// GET: Load boards/tasks
app.get('/api/data', async (req, res) => {
  try {
    const boards = await Board.find().sort({ order: 1 }).lean();
    // .lean() skips the schema's toJSON transform, so strip Mongo-only
    // fields here to keep the exact same response shape as before.
    const cleaned = boards.map(({ _id, __v, order, createdAt, updatedAt, tasks, ...rest }) => ({
      ...rest,
      tasks: (tasks || []).map(({ _id, ...task }) => task)
    }));
    res.json(cleaned);
  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST: Save full boards state
app.post('/api/data', async (req, res) => {
  const boardsData = req.body;

  if (!Array.isArray(boardsData)) {
    return res.status(400).json({ error: 'Expected an array of boards' });
  }

  try {
    const incomingIds = boardsData.map((b) => b.id);

    // Upsert every board sent by the client, preserving its tab order.
    const bulkOps = boardsData.map((board, index) => ({
      updateOne: {
        filter: { id: board.id },
        update: {
          $set: {
            id: board.id,
            name: board.name,
            tasks: board.tasks || [],
            order: index
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Board.bulkWrite(bulkOps);
    }

    // Remove any boards that are no longer present (e.g. deleted boards),
    // mirroring the old behaviour of overwriting the whole file.
    await Board.deleteMany({ id: { $nin: incomingIds } });

    res.json({ message: 'Data saved successfully!' });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`Open http://localhost:${PORT}/index.html in your browser`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
