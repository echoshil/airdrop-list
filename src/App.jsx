import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Twitter,
  MessageSquare,
  Send,
  Wallet,
  Mail,
  Globe,
  Github,
} from "lucide-react";
import "./App.css";
import NeonParticles from "./NeonParticles";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);
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
  const [lastUpdate, setLastUpdate] = useState(null);

  // Ambil data dari Google Sheet
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
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error("Format data salah:", data);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
      alert("⚠️ Gagal load data dari Google Sheets. Pastikan URL Script benar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Tambah project ke Google Sheet
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
        alert("⚠️ Data sudah terkirim, tapi format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // Pencarian project
  const filteredProjects = projects.filter((p) =>
    Object.values(p)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* 🌌 Efek Partikel */}
      <NeonParticles />

      {/* Konten Utama */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400 drop-shadow-[0_0_5px_#00ffff]">
          🚀 Airdrop Tracker Pro
        </h1>

        {/* Form Tambah Project */}
        <div className="bg-gray-800/70 backdrop-blur-sm p-4 rounded-lg mb-6 shadow-md border border-cyan-500/20">
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
                className="p-2 rounded bg-gray-900/80 text-white w-full border border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={addProject}
              disabled={loading}
              className={`${
                loading ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
              } px-4 py-2 rounded transition`}
            >
              {loading ? "Loading..." : "+ Tambah Project"}
            </button>
            <button
              onClick={fetchProjects}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Search & Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-800/80 text-white w-full md:w-1/2 border border-gray-700 focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          <p className="text-gray-400 text-sm">
            🕒 Terakhir diperbarui:{" "}
            <span className="text-cyan-400">{lastUpdate || "Belum ada"}</span>
          </p>
        </div>

        {/* Daftar Project */}
        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">
          📋 Daftar Project
        </h2>

        {filteredProjects.length === 0 ? (
          <p className="text-gray-400 text-center">Belum ada data project.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p, i) => (
              <div
                key={i}
                className="relative bg-gray-800/70 backdrop-blur-md p-4 rounded-xl shadow-md border border-gray-700 hover:border-cyan-400/40 transition-all"
              >
                {/* Tombol Hide */}
                <button
                  onClick={() => setHidden(!hidden)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-cyan-400 transition"
                >
                  {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <h3 className="text-lg font-bold text-green-400 mb-2 break-words">
                  {p.name}
                </h3>

                {p.twitter && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <Twitter size={14} className="text-sky-400" />
                    {hidden ? "••••••••••" : p.twitter}
                  </p>
                )}
                {p.discord && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <MessageSquare size={14} className="text-indigo-400" />
                    {hidden ? "••••••••••" : p.discord}
                  </p>
                )}
                {p.telegram && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <Send size={14} className="text-blue-400" />
                    {hidden ? "••••••••••" : p.telegram}
                  </p>
                )}
                {p.wallet && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <Wallet size={14} className="text-yellow-400" />
                    {hidden ? "••••••••••" : p.wallet}
                  </p>
                )}
                {p.email && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <Mail size={14} className="text-pink-400" />
                    {hidden ? "••••••••••" : p.email}
                  </p>
                )}
                {p.github && (
                  <p className="flex items-center gap-2 break-all text-sm">
                    <Github size={14} className="text-gray-300" />
                    {hidden ? "••••••••••" : p.github}
                  </p>
                )}
                {p.website && (
                  <p className="flex items-center gap-2 mt-1 text-sm">
                    <Globe size={14} className="text-blue-400" />
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline break-all hover:text-cyan-300"
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

export default App;
