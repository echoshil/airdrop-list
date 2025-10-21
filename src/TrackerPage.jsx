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
  LogOut,
  ArrowUpDown,
  CheckSquare,
  Square,
} from "lucide-react";
import NeonParticles from "./NeonParticles";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function TrackerPage({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideData, setHideData] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
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

  // === FETCH PROJECTS ===
  const fetchProjects = async () => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch {
      alert("⚠️ Gagal memuat data dari Google Sheets");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // === TAMBAH PROJECT ===
  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
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
      }
    } catch {
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // === DAILY CHECK TOGGLE ===
  const toggleDaily = async (name, current) => {
    const next = current === "CHECKED" ? "UNCHECKED" : "CHECKED";
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateDaily",
          name,
          value: next,
        }),
      });
      fetchProjects();
    } catch (err) {
      console.error("Gagal update daily:", err);
    }
  };

  // === SORTING & FILTER ===
  const filteredProjects = projects
    .filter((p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  // === LIMIT DISPLAY ===
  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <NeonParticles />

      {/* HEADER */}
      <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🚀 Airdrop Tracker
        </h1>

        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400"
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </button>
          <button
            onClick={() => setHideData(!hideData)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {hideData ? <Eye size={18} /> : <EyeOff size={18} />}
            {hideData ? "Show" : "Hide"}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="relative z-10 bg-gray-900/60 p-6 rounded-2xl max-w-5xl mx-auto mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-cyan-300">
          ➕ Tambah Project Baru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white w-full"
              />
            )
          )}
        </div>
        <button
          onClick={addProject}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded-lg shadow-md transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Loading..." : "+ Tambah Project"}
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6">
        {displayedProjects.map((p, i) => (
          <div
            key={i}
            className="relative bg-gray-900/70 backdrop-blur-md p-5 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all shadow-lg"
          >
            {/* DAILY */}
            <button
              onClick={() => toggleDaily(p.name, p.daily)}
              className="absolute top-3 right-3 text-cyan-400 hover:scale-110 transition"
            >
              {p.daily === "CHECKED" ? (
                <CheckSquare size={20} />
              ) : (
                <Square size={20} />
              )}
            </button>

            <h3 className="text-lg font-bold text-cyan-400 mb-3 mt-4">
              {p.name}
            </h3>
            {p.twitter && (
              <p className="flex items-center gap-2 text-blue-400">
                <Twitter size={18} />
                <span>{hideData ? "••••" : p.twitter}</span>
              </p>
            )}
            {p.discord && (
              <p className="flex items-center gap-2 text-indigo-400">
                <MessageCircle size={18} />
                <span>{hideData ? "••••" : p.discord}</span>
              </p>
            )}
            {p.telegram && (
              <p className="flex items-center gap-2 text-sky-400">
                <Send size={18} />
                <span>{hideData ? "••••" : p.telegram}</span>
              </p>
            )}
            {p.wallet && (
              <p className="flex items-center gap-2 text-yellow-400 break-all">
                <Wallet size={18} />
                <span>{hideData ? "••••" : p.wallet}</span>
              </p>
            )}
            {p.email && (
              <p className="flex items-center gap-2 text-pink-400">
                <Mail size={18} />
                <span>{hideData ? "••••" : p.email}</span>
              </p>
            )}
            {p.github && (
              <p className="flex items-center gap-2 text-gray-300">
                <Github size={18} />
                <span>{hideData ? "••••" : p.github}</span>
              </p>
            )}
            {p.website && (
              <p className="flex items-center gap-2 text-blue-400">
                <Globe size={18} />
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-300 break-all"
                >
                  {p.website}
                </a>
              </p>
            )}
            {p.lastupdate && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Last update: {new Date(p.lastupdate).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* READ MORE / LESS BUTTON */}
      {filteredProjects.length > 3 && (
        <div className="text-center mt-8 mb-12">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            {showAll ? "⬆️ Read Less" : "⬇️ Read More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TrackerPage;
