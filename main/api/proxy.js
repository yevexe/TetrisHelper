const https = require('https');
let globalUsers = 0;
module.exports = (req, res) => {
  // Always set CORS headers first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.query.initConnect === "1") {
    console.log('Client connecting to server....');
    globalUsers++;
    res.statusCode = 200;
    console.log('Connection established with client.'+`Total connected users: ${globalUsers}`);
    return res.end(JSON.stringify({ message: "Connection successful" }));
   
  }

  console.log('Received a request from client.');

  const endpoint = req.query.endpoint;
  if (!endpoint) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Missing endpoint parameter" }));
  }
  const apiUrl = `https://jstris.jezevec10.com/api/u/${endpoint}`;
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
        res.end(JSON.stringify({ error: "Failed to parse API response" }));
      }
    });
  }).on('error', (err) => {
    console.error("Error fetching data:", err.message);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Error fetching data from JSTRIS API" }));
  });
};

