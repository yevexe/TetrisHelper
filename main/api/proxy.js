const https = require('https');

module.exports = async (req, res) => {
  // Example: /api?endpoint=username/records/1?mode=1&best
  const endpoint = req.query.endpoint;
  if (!endpoint) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Missing endpoint parameter" }));
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
        res.statusCode = 200;
        res.end(JSON.stringify(JSON.parse(data)));
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Failed to parse API response" }));
      }
    });
  }).on('error', (err) => {
    console.error("Error fetching data:", err.message);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Error fetching data from JSTRIS API" }));
  });
};

