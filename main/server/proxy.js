const express = require('express');
const https = require('https');
const app = express();
app.use(express.json());

app.get('/api', (req, res) => {
  // Example: /api?endpoint=username/records/1?mode=1&best
  const endpoint = req.query.endpoint;
  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint parameter" });
  }
  const apiUrl = `https://jstris.jezevec10.com/api/u/${endpoint}`;
  console.log("Requesting data from:", apiUrl);

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Origin", "*");
      try {
        res.status(200).json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: "Failed to parse API response" });
      }
    });
  }).on('error', (err) => {
    console.error("Error fetching data:", err.message);
    res.status(500).json({ error: "Error fetching data from JSTRIS API" });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

