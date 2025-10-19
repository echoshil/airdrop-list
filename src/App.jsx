import React, { useEffect, useState } from "react";
import { Github, Twitter, Globe, Mail, Wallet, MessageCircle, Send, Eye, EyeOff } from "lucide-react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [visibleData, setVisibleData] = useState({}); // 👁️ data visibility per project

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
    github: "",
  });

  // Ambil data dari Google Sheets
  const fetchProjects = async () => {
    if (!GOOGLE_SCRIPT_URL) {
      alert("❌ URL Google Script belum diset di .env!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
        setFiltered(data);
        setLastUpdate(new Date().toLocaleString());
        // Default: semua data disembunyikan
        const visibility = {};
        data.forEach((p) => (visibility[p.name] = false));
        setVisibleData(visibility);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
      alert("⚠️ Gagal load data dari Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔍 Filter pencarian
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.twitter?.toLowerCase().includes(q) ||
          p.discord?.toLowerCase().includes(q) ||
          p.telegram?.toLowerCase().includes(q) ||
          p.github?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  // 🔼🔽 Sorting
  const sortProjects = () => {
    const sorted = [...filtered].sort((a, b) => {
      if (!a.name || !b.name) return 0;
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    setFiltered(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // ➕ Tambah Project
  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(formData),
      });
      const text = await res.text();
      if (text.toLowerCase().includes("ok")) {
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
          github: "",
        });
      } else {
        alert("⚠️ Data terkirim tapi format respon tidak sesuai.");
      }
    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // 👁️ Toggle visibility
  const toggleVisibility = (name) => {
    setVisibleData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // 🔒 Helper untuk sembunyikan data
  const maskData = (value, visible) => {
    if (!value) return "-";
    return visible ? value : "••••••••";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">
        🚀 Airdrop Tracker Web3
      </h1>

      {/* ➕ Tambah Project */}
      <div className="bg-gray-800/80 p-4 rounded-lg mb-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-cyan-300">
          Tambah Project Baru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "name",
            "twitter",
            "discord",
            "telegram",
            "wallet",
            "email",
            "website",
            "github",
          ].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="p-2 rounded bg-gray-700 text-white w-full focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={addProject}
            disabled={loading}
            className={`${
              loading ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            } px-4 py-2 rounded`}
          >
            {loading ? "Loading..." : "+ Tambah Project"}
          </button>
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* 🔍 Search dan Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Cari project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full md:w-1/3 text-white"
        />
        <button
          onClick={sortProjects}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
        >
          Urutkan {sortOrder === "asc" ? "↓" : "↑"}
        </button>
      </div>

      {/* 🕒 Info update */}
      {lastUpdate && (
        <p className="text-sm text-gray-400 mb-4">
          🕒 Terakhir diperbarui: {lastUpdate}
        </p>
      )}

      {/* 📋 Daftar Project */}
      {filtered.length === 0 ? (
        <p className="text-gray-400">Belum ada data project.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p, i) => (
            <div
              key={i}
              className="bg-gray-800/80 p-4 rounded-lg shadow-lg hover:shadow-cyan-400/30 transition-all"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-cyan-400">{p.name}</h3>
                <button
                  onClick={() => toggleVisibility(p.name)}
                  className="text-gray-400 hover:text-cyan-300 transition"
                >
                  {visibleData[p.name] ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {p.twitter && (
                <p className="flex items-center gap-2">
                  <Twitter size={16} className="text-blue-400" /> {p.twitter}
                </p>
              )}
              {p.discord && (
                <p className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-indigo-400" />{" "}
                  {maskData(p.discord, visibleData[p.name])}
                </p>
              )}
              {p.telegram && (
                <p className="flex items-center gap-2">
                  <Send size={16} className="text-cyan-400" />{" "}
                  {maskData(p.telegram, visibleData[p.name])}
                </p>
              )}
              {p.wallet && (
                <p className="flex items-center gap-2">
                  <Wallet size={16} className="text-yellow-400" />{" "}
                  {maskData(p.wallet, visibleData[p.name])}
                </p>
              )}
              {p.email && (
                <p className="flex items-center gap-2">
                  <Mail size={16} className="text-red-400" />{" "}
                  {maskData(p.email, visibleData[p.name])}
                </p>
              )}
              {p.website && (
                <p className="flex items-center gap-2">
                  <Globe size={16} className="text-green-400" />
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
              {p.github && (
                <p className="flex items-center gap-2">
                  <Github size={16} className="text-purple-400" />
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 underline"
                  >
                    {p.github}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
