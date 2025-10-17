export default async function handler(req, res) {
  // Izinkan akses dari browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ganti dengan URL Google Apps Script kamu
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyQ8p7cFdew_AydVBl2AEcps0_NFscde9qAoysIbTiZRakNJOVdia2RiRqK5uTxtKzj/exec';

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    return res.status(200).json({ message: text });
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.toString() });
  }
}
