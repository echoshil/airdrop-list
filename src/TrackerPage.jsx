import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
import NeonParticles from "./NeonParticles";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export default function TrackerPage() {
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
  const [hidden, setHidden] = useState(true);
  const [search, setSearch] = useState("");

  // 🔄 Ambil data dari Google Sheet
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error("Gagal load data:", err);
      alert("⚠️ Gagal memuat data dari Google Sheets. Cek URL Script.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ➕ Tambah project
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
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // ✅ anti-CORS preflight
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      console.log("Respon Apps Script:", text);

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
        alert("⚠️ Data terkirim tapi format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // 👁️ Toggle global hide/unhide
  const toggleHidden = () => setHidden(!hidden);

  // 🔍 Filter pencarian
  const filtered = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <NeonParticles />

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          🚀 Airdrop Tracker
        </h1>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={toggleHidden}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              {hidden ? (
                <>
                  <EyeOff size={18} /> Hidden
                </>
              ) : (
                <>
                  <Eye size={18} /> Visible
                </>
              )}
            </button>
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Form Tambah Project */}
        <div className="bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.2)] mb-8">
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
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="p-2 rounded bg-gray-900 border border-gray-700 focus:border-cyan-400 text-white w-full"
              />
            ))}
          </div>
          <button
            onClick={addProject}
            disabled={loading}
            className="mt-5 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg shadow-lg"
          >
            {loading ? "Mengirim..." : "+ Tambah Project"}
          </button>
        </div>

        {/* Daftar Project */}
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
          📋 Daftar Project ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada data project.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={i}
                className="bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700 hover:border-cyan-400 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-green-400 mb-2 truncate">
                  {p.name}
                </h3>
                <div className="text-sm space-y-1 break-words">
                  {p.twitter && (
                    <p>
                      🐦 Twitter:{" "}
                      {hidden ? "****" : <span>{p.twitter}</span>}
                    </p>
                  )}
                  {p.discord && (
                    <p>
                      💬 Discord:{" "}
                      {hidden ? "****" : <span>{p.discord}</span>}
                    </p>
                  )}
                  {p.telegram && (
                    <p>
                      📢 Telegram:{" "}
                      {hidden ? "****" : <span>{p.telegram}</span>}
                    </p>
                  )}
                  {p.wallet && (
                    <p className="truncate">
                      💰 Wallet: {hidden ? "****" : <span>{p.wallet}</span>}
                    </p>
                  )}
                  {p.email && (
                    <p>
                      📧 Email: {hidden ? "****" : <span>{p.email}</span>}
                    </p>
                  )}
                  {p.github && (
                    <p className="flex items-center gap-1">
                      <Github size={14} />
                      {hidden ? (
                        "****"
                      ) : (
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline break-all"
                        >
                          {p.github}
                        </a>
                      )}
                    </p>
                  )}
                  {p.website && (
                    <p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
