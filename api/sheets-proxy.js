export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyvDj88CcCLavv9gmUwj24NinBtBYkhU1v0XoXUSo-JYfx861A1lyNb4TBJunebSJM/exec"; // 🔹 Ganti dengan URL kamu
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    return res.status(200).json({ message: text });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: error.toString() });
  }
}



















