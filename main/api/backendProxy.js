import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS for your frontend domain or use ''
  res.setHeader('Access-Control-Allow-Origin', '');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const endpoint = req.query.endpoint || '/';
    const backendUrl = 'http://69.126.106.22:55000/' + endpoint;

    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' ? null : req.body,
    });

    // Pass status, headers, and body from backend response to client
    res.status(backendResponse.status);

    // Pass content-type header if present
    const contentType = backendResponse.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const data = await backendResponse.text();
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
