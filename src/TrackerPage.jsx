import React, { useEffect, useState } from "react";
import NeonParticles from "./NeonParticles";
import { Github, Eye, EyeOff } from "lucide-react";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function TrackerPage({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    github: "",
    website: "",
  });
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [hideSensitive, setHideSensitive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔄 Fetch Data
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) =>
          sortOrder === "asc"
            ? (a.name || "").localeCompare(b.name || "")
            : (b.name || "").localeCompare(a.name || "")
        );
        setProjects(sortedData);
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error("Data tidak sesuai format:", data);
      }
    } catch (err) {
      alert("⚠️ Gagal load data dari Google Sheets!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  // ➕ Add project
  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
          github: "",
          website: "",
        });
      } else {
        alert("⚠️ Data terkirim tapi respon tidak sesuai.");
      }
    } catch {
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter
  const filtered = projects.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🔒 Hide/Unhide helper
  const renderField = (label, value) => {
    if (!value) return null;
    const masked = hideSensitive
      ? "•".repeat(Math.min(value.length, 8)) + (value.length > 8 ? "..." : "")
      : value;
    return (
      <p className="truncate">
        {label}: <span className="text-gray-300">{masked}</span>
      </p>
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <NeonParticles />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            🚀 Airdrop Tracker Pro
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setHideSensitive(!hideSensitive)}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
            >
              {hideSensitive ? <EyeOff size={18} /> : <Eye size={18} />}
              {hideSensitive ? "Unhide" : "Hide"}
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded-lg bg-gray-800 text-white w-full md:w-1/2"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 rounded-lg bg-gray-800 text-white"
          >
            <option value="asc">🔼 Nama A–Z</option>
            <option value="desc">🔽 Nama Z–A</option>
          </select>
        </div>

        {/* Add Project */}
        <div className="bg-gray-800/70 p-6 rounded-2xl shadow-lg mb-8">
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
              "github",
              "website",
            ].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.toUpperCase()}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="p-2 rounded-lg bg-gray-900 border border-gray-700 focus:border-cyan-400 text-white w-full"
              />
            ))}
          </div>
          <button
            onClick={addProject}
            disabled={loading}
            className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-lg shadow-lg hover:shadow-[0_0_15px_#22c55e]"
          >
            {loading ? "Loading..." : "+ Tambah Project"}
          </button>
        </div>

        {/* Info Update */}
        <div className="text-sm text-gray-400 mb-6">
          🕒 Terakhir diperbarui:{" "}
          <span className="text-cyan-400">
            {lastUpdate || "Belum ada data"}
          </span>
        </div>

        {/* List Project */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada project.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={i}
                className="bg-gray-800/60 border border-gray-700 p-5 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all"
              >
                <h3 className="text-xl font-bold text-cyan-400 mb-2 truncate">
                  {p.name}
                </h3>
                {p.twitter && renderField("🐦 Twitter", p.twitter)}
                {p.discord && renderField("💬 Discord", p.discord)}
                {p.telegram && renderField("📢 Telegram", p.telegram)}
                {p.wallet && renderField("💰 Wallet", p.wallet)}
                {p.email && renderField("📧 Email", p.email)}
                {p.github && (
                  <p className="truncate flex items-center gap-2">
                    <Github size={16} />{" "}
                    {hideSensitive
                      ? "••••••••"
                      : (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline truncate"
                          >
                            {p.github}
                          </a>
                        )}
                  </p>
                )}
                {p.website && (
                  <p className="truncate">
                    🌐 Website:{" "}
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline break-all"
                    >
                      {p.website}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackerPage;
