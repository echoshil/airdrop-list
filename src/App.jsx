import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
  });
  const [theme, setTheme] = useState("dark");

  // 🌓 Toggle dark/light mode
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  // 🔹 Load data dari Google Sheets (via API key)
  const loadProjects = async () => {
    try {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const range = "airdrop_tracker!A2:G1000";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const res = await axios.get(url);
      const data = res.data.values || [];
      const mapped = data.map((r) => ({
        name: r[0] || "",
        twitter: r[1] || "",
        discord: r[2] || "",
        telegram: r[3] || "",
        wallet: r[4] || "",
        email: r[5] || "",
        website: r[6] || "",
      }));

      setProjects(mapped);
    } catch (err) {
      console.error("❌ Gagal load data:", err);
      alert("Tidak bisa mengambil data dari Google Sheets. Pastikan Sheet kamu public & API key benar.");
    }
  };

  // 🔹 Tambah project baru ke Google Sheets via Apps Script
  const addProject = async () => {
    if (!form.name.trim()) return alert("Nama project wajib diisi!");
    try {
      // Tambah ke UI lokal dulu
      setProjects([...projects, form]);

      // Kirim ke Google Sheets lewat Apps Script
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
      const res = await axios.post(scriptUrl, form);

      if (res.status === 200) {
        alert("✅ Project berhasil ditambahkan ke Google Sheets!");
        setForm({
          name: "",
          twitter: "",
          discord: "",
          telegram: "",
          wallet: "",
          email: "",
          website: "",
        });
      } else {
        alert("⚠️ Gagal menambahkan ke Google Sheets");
      }
    } catch (err) {
      console.error("❌ Gagal menambah project:", err);
      alert("Tidak bisa menambah data. Cek URL Apps Script kamu di .env");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* 🔹 Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-600">
        <h1 className="text-2xl font-bold">💰 Airdrop Tracker</h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
        >
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      {/* 🔹 Form Input */}
      <main className="p-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Tambah Project Baru</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="Nama Project"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="text"
            placeholder="🐦 Twitter"
            value={form.twitter}
            onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="text"
            placeholder="💬 Discord"
            value={form.discord}
            onChange={(e) => setForm({ ...form, discord: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="text"
            placeholder="📱 Telegram"
            value={form.telegram}
            onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="text"
            placeholder="💰 Wallet Address"
            value={form.wallet}
            onChange={(e) => setForm({ ...form, wallet: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="email"
            placeholder="📧 Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
          <input
            type="text"
            placeholder="🌐 Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="border p-2 rounded bg-transparent"
          />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={addProject}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
          >
            ➕ Tambah Project
          </button>
          <button
            onClick={loadProjects}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* 🔹 Daftar Project */}
        <h2 className="text-lg font-semibold mb-2">Daftar Project</h2>
        <ul className="space-y-3">
          {projects.length === 0 && <p className="opacity-70">Belum ada project...</p>}
          {projects.map((p, i) => (
            <li
              key={i}
              className="p-4 rounded border border-gray-600 hover:bg-gray-800 transition"
            >
              <strong className="text-lg">{p.name}</strong>
              <div className="text-sm mt-1 space-y-1">
                {p.twitter && (
                  <p>
                    🐦{" "}
                    <a href={p.twitter} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      {p.twitter}
                    </a>
                  </p>
                )}
                {p.discord && <p>💬 {p.discord}</p>}
                {p.telegram && <p>📱 {p.telegram}</p>}
                {p.wallet && <p>💰 {p.wallet}</p>}
                {p.email && <p>📧 {p.email}</p>}
                {p.website && (
                  <p>
                    🌐{" "}
                    <a href={p.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      {p.website}
                    </a>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
