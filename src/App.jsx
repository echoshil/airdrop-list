import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NeonParticles from "./NeonParticles";
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

  // 🌙 Toggle dark/light mode
  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // 🔄 Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        setFiltered(data);
        setLastUpdate(new Date().toLocaleString());
      }
    } catch {
      alert("⚠️ Gagal memuat data dari Google Sheets. Cek URL Script.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    fetchProjects();
  }, []);

  // 🔍 Search filter
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

  // ➕ Add project
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

      const result = await res.json();

      if (result.status === "OK") {
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
        alert("⚠️ Gagal menambah data: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gagal kirim ke Google Script!");
    }
  };

  // ❌ Delete project
  const deleteProject = async (name) => {
    if (!window.confirm(`Hapus project "${name}"?`)) return;
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, action: "delete" }),
      });
      const result = await res.json();
      if (result.status === "OK") {
        alert("🗑️ Project dihapus!");
        fetchProjects();
      } else {
        alert("⚠️ Gagal hapus project!");
      }
    } catch {
      alert("Gagal hapus project!");
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-200 text-gray-900"
      }`}
    >
      <NeonParticles />

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            🚀 Airdrop Tracker Web3
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 10px #00ffff" }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 shadow-lg text-white"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </motion.button>
        </div>

        {/* Search bar + total */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-lg font-semibold">
            🧮 Total Project:{" "}
            <span className="text-cyan-400 font-bold">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="🔍 Cari project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white w-72 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Form tambah */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.2)] mb-10"
        >
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">
            ➕ Tambah Project Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              "name",
              "twitter",
              "discord",
              "telegram",
              "wallet",
              "email",
              "website",
            ].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="p-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-cyan-400 text-white w-full"
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addProject}
            className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-lg shadow-lg hover:shadow-[0_0_15px_#22c55e]"
          >
            + Tambah Project
          </motion.button>
        </motion.div>

        {/* Info update */}
        <div className="text-sm text-gray-400 mb-6">
          🕒 Terakhir diperbarui:{" "}
          <span className="text-cyan-400">{lastUpdate || "Belum ada"}</span>
        </div>

        {/* Daftar Project */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada project.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 25px rgba(0,255,255,0.3)",
                }}
                className="bg-gray-900/70 backdrop-blur-lg p-5 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all"
              >
                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    {p.name}
                  </h3>
                  {p.twitter && <p>🐦 Twitter: {p.twitter}</p>}
                  {p.discord && <p>💬 Discord: {p.discord}</p>}
                  {p.telegram && <p>📢 Telegram: {p.telegram}</p>}
                  {p.wallet && <p>💰 Wallet: {p.wallet}</p>}
                  {p.email && <p>📧 Email: {p.email}</p>}
                  {p.website && (
                    <p>
                      🌐 Website:{" "}
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        {p.website}
                      </a>
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => deleteProject(p.name)}
                  className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 px-4 py-2 rounded-lg shadow-md text-white"
                >
                  🗑️ Hapus
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
