import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NeonParticles from "./NeonParticles.jsx";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterDaily, setFilterDaily] = useState("all");
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
    dailyStatus: "❌",
  });

  // 🌙 Toggle Dark Mode
  const toggleDarkMode = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // 🔄 Fetch dari Google Sheets
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
    } catch (err) {
      alert("⚠️ Gagal memuat data dari Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    fetchProjects();
  }, []);

  // 🔍 Search + Filter
  useEffect(() => {
    let result = [...projects];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.NAMA?.toLowerCase().includes(q) ||
          p.TWITTER?.toLowerCase().includes(q) ||
          p.WALLET?.toLowerCase().includes(q)
      );
    }

    if (filterDaily !== "all") {
      result = result.filter(
        (p) =>
          (filterDaily === "done" && p.DAILYSTATUS === "✅") ||
          (filterDaily === "pending" && p.DAILYSTATUS !== "✅")
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.NAMA.localeCompare(b.NAMA));
    } else if (sortBy === "date") {
      result.sort(
        (a, b) =>
          new Date(b.DAILYSTATUS || 0) - new Date(a.DAILYSTATUS || 0)
      );
    }

    setFiltered(result);
  }, [search, sortBy, filterDaily, projects]);

  // ➕ Tambah Project
  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          NAMA: formData.name,
          TWITTER: formData.twitter,
          DISCORD: formData.discord,
          TELEGRAM: formData.telegram,
          WALLET: formData.wallet,
          EMAIL: formData.email,
          WEBSITE: formData.website,
          DAILYSTATUS: "❌",
        }),
      });
      const text = await res.text();
      if (text.includes("OK")) {
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
        alert("⚠️ Data terkirim, tapi tidak disimpan dengan benar.");
      }
    } catch {
      alert("Gagal kirim ke Google Script!");
    }
  };

  // ✅ Toggle Daily Status
  const toggleDaily = async (name, status) => {
    const newStatus = status === "✅" ? "❌" : "✅";
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NAMA: name, DAILYSTATUS: newStatus }),
      });
      fetchProjects();
    } catch {
      alert("Gagal update status harian.");
    }
  };

  // ❌ Hapus Project
  const deleteProject = async (name) => {
    if (!window.confirm(`Hapus project "${name}"?`)) return;
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NAMA: name, action: "delete" }),
      });
      const text = await res.text();
      if (text.includes("OK")) fetchProjects();
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
            🚀 Airdrop Tracker Web3+
          </motion.h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-lg text-white"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 justify-between mb-6">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white w-64"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="name">Sort: Nama</option>
            <option value="date">Sort: Tanggal</option>
          </select>

          <select
            value={filterDaily}
            onChange={(e) => setFilterDaily(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white"
          >
            <option value="all">Semua</option>
            <option value="done">✅ Selesai</option>
            <option value="pending">⏳ Belum</option>
          </select>
        </div>

        {/* Form tambah project */}
        <div className="bg-gray-800/70 p-6 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.2)] mb-10">
          <h2 className="text-xl mb-4 text-cyan-300 font-semibold">
            ➕ Tambah Project
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
            ].map((f) => (
              <input
                key={f}
                placeholder={f.toUpperCase()}
                value={formData[f]}
                onChange={(e) =>
                  setFormData({ ...formData, [f]: e.target.value })
                }
                className="p-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-cyan-400 text-white"
              />
            ))}
          </div>
          <button
            onClick={addProject}
            className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-lg shadow-lg"
          >
            + Tambah Project
          </button>
        </div>

        {/* Daftar Project */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada project.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(0,255,255,0.3)",
                }}
                className="bg-gray-900/70 p-5 rounded-2xl border border-gray-700"
              >
                <h3 className="text-xl font-bold text-cyan-400 mb-2">
                  {p.NAMA}
                </h3>
                {p.TWITTER && <p>🐦 {p.TWITTER}</p>}
                {p.DISCORD && <p>💬 {p.DISCORD}</p>}
                {p.TELEGRAM && <p>📢 {p.TELEGRAM}</p>}
                {p.WALLET && <p>💰 {p.WALLET}</p>}
                {p.EMAIL && <p>📧 {p.EMAIL}</p>}
                {p.WEBSITE && (
                  <a
                    href={p.WEBSITE}
                    target="_blank"
                    className="text-blue-400 underline"
                  >
                    🌐 {p.WEBSITE}
                  </a>
                )}

                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => toggleDaily(p.NAMA, p.DAILYSTATUS)}
                    className={`px-3 py-1 rounded ${
                      p.DAILYSTATUS === "✅"
                        ? "bg-green-600"
                        : "bg-gray-700 hover:bg-cyan-500"
                    }`}
                  >
                    {p.DAILYSTATUS === "✅"
                      ? "✅ Done"
                      : "⏳ Belum"}
                  </button>
                  <button
                    onClick={() => deleteProject(p.NAMA)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-400 mt-6 text-center">
          🕒 Terakhir diperbarui:{" "}
          <span className="text-cyan-400">{lastUpdate || "Belum ada"}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
