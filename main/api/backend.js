require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Leaderboard, sequelize } = require('./leaderboardModel.js'); // your Sequelize schema
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

// POST a new leaderboard entry
app.post('/leaderboard', async (req, res) => {
  try {
    const { username, sprint, cheese, survival, ultra } = req.body;
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

