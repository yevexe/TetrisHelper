import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      username TEXT PRIMARY KEY,
      sprint    TEXT NOT NULL,
      cheese    TEXT NOT NULL,
      survival  TEXT NOT NULL,
      ultra     TEXT NOT NULL
    )
  `);
}

function parseRow(row) {
  return {
    username: row.username,
    sprint:   JSON.parse(row.sprint),
    cheese:   JSON.parse(row.cheese),
    survival: JSON.parse(row.survival),
    ultra:    JSON.parse(row.ultra),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await initDB();

  const endpoint = req.query.endpoint || '';

  // GET connect
  if (endpoint === 'connect') {
    return res.status(200).send('Connection successful!');
  }

  // GET all leaderboard entries
  if (endpoint === 'leaderboard' && req.method === 'GET') {
    const result = await client.execute('SELECT * FROM leaderboard');
    return res.json(result.rows.map(parseRow));
  }

  // POST new leaderboard entry
  if (endpoint === 'leaderboard' && req.method === 'POST') {
    const { username, sprint, cheese, survival, ultra } = req.body;
    const existing = await client.execute({
      sql:  'SELECT username FROM leaderboard WHERE username = ?',
      args: [username],
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists in leaderboard' });
    }
    await client.execute({
      sql:  'INSERT INTO leaderboard (username, sprint, cheese, survival, ultra) VALUES (?, ?, ?, ?, ?)',
      args: [username, JSON.stringify(sprint), JSON.stringify(cheese), JSON.stringify(survival), JSON.stringify(ultra)],
    });
    return res.json({ message: 'Created successfully' });
  }

  // PUT leaderboard/:username
  const putMatch = endpoint.match(/^leaderboard\/([^/]+)\/?$/);
  if (putMatch && req.method === 'PUT') {
    const username = putMatch[1].toLowerCase();
    const { sprint, cheese, survival, ultra } = req.body;
    const result = await client.execute({
      sql:  'UPDATE leaderboard SET sprint = ?, cheese = ?, survival = ?, ultra = ? WHERE username = ?',
      args: [JSON.stringify(sprint), JSON.stringify(cheese), JSON.stringify(survival), JSON.stringify(ultra), username],
    });
    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ message: 'Updated successfully' });
  }

  // DELETE leaderboard/:username
  const deleteMatch = endpoint.match(/^leaderboard\/([^/]+)\/?$/);
  if (deleteMatch && req.method === 'DELETE') {
    const username = deleteMatch[1].toLowerCase();
    const result = await client.execute({
      sql:  'DELETE FROM leaderboard WHERE username = ?',
      args: [username],
    });
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  }

  // GET leaderboard/:username
  const userMatch = endpoint.match(/^leaderboard\/([^/]+)\/?$/);
  if (userMatch) {
    const username = userMatch[1].toLowerCase();
    const result = await client.execute({
      sql:  'SELECT * FROM leaderboard WHERE username = ?',
      args: [username],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(parseRow(result.rows[0]));
  }

  return res.status(400).json({ error: 'Unknown endpoint' });
}
