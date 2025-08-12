const https = require('https');
let globalUsers = 0;
console.log("Server Started! Now Listening for Connections...");

module.exports = (req, res) => {
  // Always set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  console.log('Received a request from client.');

  const endpoint = req.query.endpoint;
  if (!endpoint) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Missing endpoint parameter" }));
  }
  const backendUrl = 'http://69.126.106.22:55000/' + req.url.replace('/api/proxy', '');
  console.log("Proxying request to:", apiUrl);

  https.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.statusCode = 200;
        res.end(JSON.stringify(JSON.parse(data)));
      } catch (e) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Failed to parse backend response" }));
      }
    });
  }).on('error', (err) => {
    console.error("Error fetching data:", err.message);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Error fetching data from backend" }));
  });
};

