import React, { useEffect, useState } from "react";
import { Github, Eye, EyeOff, Search, Filter } from "lucide-react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
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

  // 🔄 Fetch data dari Google Sheet
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
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
      alert("⚠️ Gagal memuat data dari Google Sheets. Cek URL Script.");
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

  // ➕ Tambah project baru
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
          github: "",
          website: "",
        });
      } else {
        alert("⚠️ Data terkirim, tapi format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (err) {
      console.error("Gagal kirim:", err);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Sorting
  const sortProjects = () => {
    const sorted = [...filtered].sort((a, b) =>
      sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setFiltered(sorted);
    setSortAsc(!sortAsc);
  };

  // 👁️ Hide/unhide semua data
  const toggleHide = () => setHidden(!hidden);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🚀 Airdrop Tracker Pro
          </h1>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-400 outline-none"
              />
            </div>

            <button
              onClick={sortProjects}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              <Filter size={16} />
              Urutkan {sortAsc ? "↓" : "↑"}
            </button>

            <button
              onClick={toggleHide}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
              {hidden ? "Unhide" : "Hide"}
            </button>
          </div>
        </div>

        {/* FORM TAMBAH PROJECT */}
        <div className="bg-gray-800 p-5 rounded-xl mb-10 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Tambah Project Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {["name", "twitter", "discord", "telegram", "wallet", "email", "github", "website"].map(
              (field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  className="p-2 rounded bg-gray-900 text-white w-full border border-gray-700 focus:border-cyan-400"
                />
              )
            )}
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
              Refresh
            </button>
          </div>
        </div>

        {/* TERAKHIR DIPERBARUI */}
        <p className="text-sm text-gray-400 mb-4">
          🕒 Terakhir diperbarui:{" "}
          <span className="text-cyan-400">
            {lastUpdate || "Belum ada data."}
          </span>
        </p>

        {/* DAFTAR PROJECT */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada data project.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={i}
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-400 transition-all shadow-lg relative"
              >
                <h3 className="text-lg font-bold text-green-400 mb-2">{p.name}</h3>

                <div className="flex flex-col gap-1 text-sm break-words">
                  {p.twitter && (
                    <p>🐦 {hidden ? "••••••••" : p.twitter}</p>
                  )}
                  {p.discord && (
                    <p>💬 {hidden ? "••••••••" : p.discord}</p>
                  )}
                  {p.telegram && (
                    <p>📢 {hidden ? "••••••••" : p.telegram}</p>
                  )}
                  {p.wallet && (
                    <p>💰 {hidden ? "••••••••" : p.wallet}</p>
                  )}
                  {p.email && (
                    <p>📧 {hidden ? "••••••••" : p.email}</p>
                  )}
                  {p.github && (
                    <p className="flex items-center gap-2">
                      <Github size={14} />{" "}
                      {hidden ? (
                        "••••••••"
                      ) : (
                        <a
                          href={
                            p.github.startsWith("http")
                              ? p.github
                              : `https://github.com/${p.github}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 underline hover:text-white"
                        >
                          {p.github}
                        </a>
                      )}
                    </p>
                  )}
                  {p.website && (
                    <p>
                      🌐{" "}
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline hover:text-cyan-300"
                      >
                        {p.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
