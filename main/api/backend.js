const express = require('express');
const cors = require('cors');
const { Leaderboard, sequelize } = require('./leaderboardModel.js'); // your Sequelize schema
const { Op } = require('sequelize');
let PORT = 8080;
const app = express();
app.use(cors());
app.use(express.json());

// Sync DB schema when the server starts
(async () => {
  await sequelize.sync(); // creates table if missing
})();

app.get('/connect', (req, res) => {
  res.status(200).send('Connection successful!');
});

app.get('/', (req, res) => res.send('Server is running!'));

// GET all leaderboard entries
app.get('/leaderboard', async (req, res) => {
  const rows = await Leaderboard.findAll();
  res.json(rows);
});

// GET leaderboard entry by username
app.get('/leaderboard/:username', async (req, res) => {
  try {
    const username = req.params.username;

    const entry = await Leaderboard.findOne({
      where: { username }
    });

    if (!entry) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});
app.get('/leaderboard/destroy/:username', async (req,res) =>{
  try {
    const username = req.params.username;
    const deletedCount = await Leaderboard.destroy({
    where: { username }
  });
  }catch (error) {
      console.error('Error removing user:', error);
  }
})
// GET leaderboard entry by username and game
app.get('/leaderboard/:username/:game', async (req, res) => {
  try {
    const { username, game } = req.params;

    if (!username || !game) {
      return res.status(400).json({ error: 'Username and game are required' });
    }

    const entry = await Leaderboard.findOne({

      attributes: [game], 

      where: {
          username,
          [game]: { [Op.not]: null }
      }
    });
  
    if (!entry) {
      return res.status(404).json({ error: 'No entry found for that username and game' });
    }

    res.json(entry);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// POST a new leaderboard entry
app.post('/leaderboard', async (req, res) => {
  try {
    const { username, sprint, cheese, survival, ultra } = req.body;

    // Check if the username already exists
    const existingEntry = await Leaderboard.findOne({ where: { username } });
    if (existingEntry) {
      return res.status(400).json({ error: 'Username already exists in leaderboard' });
    }

    // Create new entry
    const entry = await Leaderboard.create({
      username,
      sprint,
      cheese,
      survival,
      ultra
    });

    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const server = app.listen(PORT, '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Express listening on ${addr.address}:${addr.port}`);
});

