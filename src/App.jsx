import React, { useEffect, useState } from "react";
import {
  Twitter,
  Send,
  Globe,
  Wallet,
  Mail,
  Plus,
  RefreshCcw,
  Loader2,
  MessageCircle,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data.reverse());
    } catch (err) {
      console.error(err);
      alert("⚠️ Gagal memuat data. Pastikan URL Script benar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async () => {
    if (!formData.name.trim()) return alert("❗Nama project wajib diisi.");

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();

      if (text.includes("OK")) {
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
        alert("⚠️ Data terkirim tapi respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      alert("🚨 Gagal mengirim data ke Google Script!");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111] text-gray-200 p-8 font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600"
      >
        🚀 Web3 Airdrop Tracker
      </motion.h1>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161616]/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">
          ➕ Tambah Project Baru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["name", "twitter", "discord", "telegram", "wallet", "email", "website"].map(
            (field) => (
              <input
                key={field}
                type="text"
                placeholder={
                  field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="bg-[#0d0d0d] border border-gray-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
              />
            )
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={addProject}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-4 py-2 rounded-xl font-medium shadow-md transition"
          >
            <Plus size={18} /> Tambah Project
          </button>
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-4 py-2 rounded-xl font-medium shadow-md transition"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </motion.div>

      {/* LIST */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-purple-400">
        📋 Daftar Project
      </h2>

      {projects.length === 0 ? (
        <p className="text-gray-500">Belum ada data project.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414]/90 backdrop-blur-md border border-gray-800 p-5 rounded-2xl shadow-lg hover:border-cyan-600 hover:shadow-cyan-600/20 transition"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-2">
                {p.name || "Tanpa Nama"}
              </h3>
              <div className="space-y-1 text-sm text-gray-400">
                {p.twitter && (
                  <p className="flex items-center gap-2">
                    <Twitter size={15} /> {p.twitter}
                  </p>
                )}
                {p.discord && (
                  <p className="flex items-center gap-2">
                    <Hash size={15} /> {p.discord}
                  </p>
                )}
                {p.telegram && (
                  <p className="flex items-center gap-2">
                    <Send size={15} /> {p.telegram}
                  </p>
                )}
                {p.wallet && (
                  <p className="flex items-center gap-2">
                    <Wallet size={15} /> {p.wallet}
                  </p>
                )}
                {p.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={15} /> {p.email}
                  </p>
                )}
                {p.website && (
                  <p className="flex items-center gap-2">
                    <Globe size={15} />
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {p.website}
                    </a>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
