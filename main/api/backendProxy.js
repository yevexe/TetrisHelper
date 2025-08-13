export default async function handler(req, res) {
  const { default: fetch } = await import('node-fetch');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const endpoint = req.query.endpoint || '/';
    const backendUrl = 'http://69.126.106.22:55000/' + endpoint;

    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'GET' ? null : JSON.stringify(req.body),
    });

    let raw = await backendResponse.text();
    let data;

    // Try to parse as JSON, fallback to text
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    res.status(backendResponse.status);

    if (typeof data === 'object') {
      res.json(data); // ensures it's sent as JSON
    } else {
      res.send(data); // sends plain text
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
