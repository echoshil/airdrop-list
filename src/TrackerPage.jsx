import React, { useEffect, useState } from "react";
import {
  Twitter,
  MessageCircle,
  Send,
  Wallet,
  Mail,
  Globe,
  Github,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Search,
  SortAsc,
  LogOut,
} from "lucide-react";
import NeonParticles from "./NeonParticles";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const TrackerPage = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideData, setHideData] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔄 Fetch data dari Google Script
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
      alert("⚠️ Gagal memuat data dari Google Sheets. Cek URL Script.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔍 Filter dan urutan
  const filteredProjects = projects
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase().trim())
    )
    .sort((a, b) =>
      sortAsc
        ? a.name?.localeCompare(b.name)
        : b.name?.localeCompare(a.name)
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#030014] to-[#050521] text-white overflow-x-hidden">
      <NeonParticles />

      {/* 🔹 Header */}
      <div className="relative z-10 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-md">
          🚀 Airdrop Tracker Pro
        </h1>
        <p className="text-gray-400 text-sm">
          Pantau semua project airdrop kamu dalam satu tempat
        </p>
      </div>

      {/* 🔹 Toolbar */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-6 mb-6">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900/70 text-white pl-9 pr-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Sorting */}
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-all"
        >
          <SortAsc size={16} />
          {sortAsc ? "Urutkan A–Z" : "Urutkan Z–A"}
        </button>

        {/* Hide/Unhide */}
        <button
          onClick={() => setHideData(!hideData)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-all"
        >
          {hideData ? <Eye size={16} /> : <EyeOff size={16} />}
          {hideData ? "Tampilkan Data" : "Sembunyikan Data"}
        </button>

        {/* Refresh */}
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* 🔹 Last Update */}
      {lastUpdate && (
        <p className="text-center text-gray-400 text-sm mb-6">
          🕒 Terakhir diperbarui: {lastUpdate}
        </p>
      )}

      {/* 🔹 Daftar Project */}
      <div className="relative z-10 grid gap-4 px-6 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProjects.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            Tidak ada project ditemukan.
          </p>
        ) : (
          filteredProjects.map((p, i) => (
            <div
              key={i}
              className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 relative"
            >
              <h3 className="text-lg font-semibold text-green-400 mb-3 truncate">
                {p.name}
              </h3>

              {p.twitter && (
                <p className="flex items-center gap-2 text-blue-400">
                  <Twitter className="text-[#1DA1F2]" size={18} />
                  <span>{hideData ? "••••••••" : p.twitter}</span>
                </p>
              )}

              {p.discord && (
                <p className="flex items-center gap-2 text-indigo-400">
                  <MessageCircle className="text-[#5865F2]" size={18} />
                  <span>{hideData ? "••••••••" : p.discord}</span>
                </p>
              )}

              {p.telegram && (
                <p className="flex items-center gap-2 text-sky-400">
                  <Send className="text-[#0088cc]" size={18} />
                  <span>{hideData ? "••••••••" : p.telegram}</span>
                </p>
              )}

              {p.wallet && (
                <p className="flex items-center gap-2 text-yellow-400 truncate">
                  <Wallet size={18} />
                  <span>{hideData ? "••••••••" : p.wallet}</span>
                </p>
              )}

              {p.email && (
                <p className="flex items-center gap-2 text-pink-400">
                  <Mail size={18} />
                  <span>{hideData ? "••••••••" : p.email}</span>
                </p>
              )}

              {p.github && (
                <p className="flex items-center gap-2 text-gray-300">
                  <Github size={18} className="text-white" />
                  <span>{hideData ? "••••••••" : p.github}</span>
                </p>
              )}

              {p.website && (
                <p className="flex items-center gap-2 text-blue-400">
                  <Globe size={18} />
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-300 truncate"
                  >
                    {p.website}
                  </a>
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrackerPage;
