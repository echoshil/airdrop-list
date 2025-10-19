import React, { useEffect, useState } from "react";
import "./App.css";
import NeonParticles from "./NeonParticles";
import { Eye, EyeOff, LogOut } from "lucide-react";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const TrackerPage = ({ onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch {
      alert("⚠️ Gagal load data dari Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
        alert("✅ Project ditambahkan!");
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

  return (
    <div className="relative min-h-screen bg-gray-950 text-white p-6 overflow-hidden">
      <NeonParticles />

      <div className="relative z-10 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚀 Airdrop Tracker</h1>
        <button
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            onLogout();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-3">Tambah Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {["name", "twitter", "discord", "telegram", "wallet", "email", "github", "website"].map(
            (field) => (
              <input
                key={field}
                type="text"
                placeholder={field.toUpperCase()}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="p-2 rounded bg-gray-800 text-white w-full border border-gray-700 focus:border-cyan-400 outline-none"
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
            Refresh Data
          </button>
          <button
            onClick={() => setShowData(!showData)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2"
          >
            {showData ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
            {showData ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">📋 Daftar Project</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {projects.map((p, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 p-4 rounded-xl shadow hover:shadow-cyan-500/20 transition-all"
          >
            <h3 className="text-lg font-bold text-green-400">{p.name}</h3>
            {showData ? (
              <>
                {p.twitter && <p>🐦 {p.twitter}</p>}
                {p.discord && <p>💬 {p.discord}</p>}
                {p.telegram && <p>📢 {p.telegram}</p>}
                {p.wallet && <p>💰 {p.wallet}</p>}
                {p.email && <p>📧 {p.email}</p>}
                {p.github && <p>💻 {p.github}</p>}
              </>
            ) : (
              <>
                {p.twitter && <p>🐦 •••••••</p>}
                {p.discord && <p>💬 •••••••</p>}
                {p.telegram && <p>📢 •••••••</p>}
                {p.wallet && <p>💰 •••••••</p>}
                {p.email && <p>📧 •••••••</p>}
                {p.github && <p>💻 •••••••</p>}
              </>
            )}
            {p.website && (
              <a
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline block mt-2"
              >
                🌐 {p.website}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackerPage;
