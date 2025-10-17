import React, { useEffect, useState } from "react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [lastUpdate, setLastUpdate] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
  });

  // 🌙 Toggle Dark Mode
  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // 🔄 Fetch data dari Google Sheets
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        setFiltered(data);
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error("Format data salah:", data);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
      alert("⚠️ Gagal load data dari Google Sheets. Cek URL Script.");
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Auto fetch pertama kali
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    fetchProjects();
  }, []);

  // 🔍 Filter saat user mengetik
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.twitter?.toLowerCase().includes(q) ||
          p.discord?.toLowerCase().includes(q) ||
          p.telegram?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  // ➕ Tambah project
  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, action: "add" }),
      });
      const text = await res.text();
      if (text.includes("OK")) {
        alert("✅ Project berhasil ditambahkan!");
        fetchProjects();
        setFormData({
          name: "",
          twitter: "",
          discord: "",
          telegram: "",
          wallet: "",
          email: "",
          website: "",
        });
      } else {
        console.warn("Respon aneh:", text);
        alert("⚠️ Data terkirim, tapi respon tidak sesuai. Cek Apps Script.");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim data ke Google Script!");
    }
  };

  // ❌ Hapus project
  const deleteProject = async (name) => {
    if (!window.confirm(`Hapus project "${name}" dari daftar?`)) return;
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, action: "delete" }),
      });
      const text = await res.text();
      if (text.includes("OK")) {
        alert("🗑️ Project berhasil dihapus!");
        fetchProjects();
      } else {
        console.warn("Respon delete tidak sesuai:", text);
        alert("⚠️ Gagal menghapus. Pastikan Apps Script punya action delete.");
      }
    } catch (e) {
      console.error(e);
      alert("❌ Gagal kirim permintaan hapus ke Google Script!");
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} p-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚀 Airdrop Tracker Dashboard</h1>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Counter & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="text-lg font-semibold">
          🧮 Total Project: <span className="text-green-500">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded bg-gray-700 text-white focus:outline-none w-64"
          />
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Form Tambah Project */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Tambah Project Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {["name", "twitter", "discord", "telegram", "wallet", "email", "website"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="p-2 rounded bg-gray-700 text-white w-full"
            />
          ))}
        </div>
        <button
          onClick={addProject}
          className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          + Tambah Project
        </button>
      </div>

      {/* Last Update Info */}
      <div className="text-sm text-gray-400 mb-3">
        🕒 Terakhir diperbarui: {lastUpdate || "Belum ada"}
      </div>

      {/* Daftar Project */}
      {filtered.length === 0 ? (
        <p className="text-gray-400">Belum ada data project.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p, i) => (
            <div
              key={i}
              className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-all"
            >
              <div>
                <h3 className="text-lg font-bold text-green-400">{p.name}</h3>
                {p.twitter && <p>🐦 Twitter: {p.twitter}</p>}
                {p.discord && <p>💬 Discord: {p.discord}</p>}
                {p.telegram && <p>📢 Telegram: {p.telegram}</p>}
                {p.wallet && <p>💰 Wallet: {p.wallet}</p>}
                {p.email && <p>📧 Email: {p.email}</p>}
                {p.website && (
                  <p>
                    🌐 Website:{" "}
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      {p.website}
                    </a>
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteProject(p.name)}
                className="mt-3 md:mt-0 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
              >
                🗑️ Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
