import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, CheckCircle, Circle } from "lucide-react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState({});
  const [dailyStatus, setDailyStatus] = useState({});
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
  const [lastUpdate, setLastUpdate] = useState(null);

  const mask = (value) => (value ? "•".repeat(Math.min(value.length, 10)) : "");

  const toggleVisibility = (index) => {
    setVisible((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleDaily = (index) => {
    setDailyStatus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

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

  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }

    if (!GOOGLE_SCRIPT_URL) {
      alert("❌ URL Google Script belum diset di .env!");
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
      console.log("Respon:", text);

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
        console.warn("Respon Apps Script:", text);
        alert("⚠️ Data terkirim, tapi format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
      >
        🚀 Airdrop Tracker
      </motion.h1>

      {/* Search Bar + Last Update */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <input
          type="text"
          placeholder="🔍 Cari project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full md:w-1/2 focus:ring-2 focus:ring-cyan-400 outline-none"
        />
        <p className="text-sm text-gray-400">
          🕒 Terakhir diperbarui:{" "}
          <span className="text-cyan-400">{lastUpdate || "Belum ada"}</span>
        </p>
      </div>

      {/* Form tambah project */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">
          ➕ Tambah Project Baru
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
              className="p-2 rounded bg-gray-700 text-white w-full"
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

      {/* Daftar Project */}
      <h2 className="text-2xl font-semibold mb-4">📋 Daftar Project</h2>

      {filteredProjects.length === 0 ? (
        <p className="text-gray-400">Belum ada data project.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:border-cyan-400 transition-all"
            >
              <h3 className="text-lg font-bold text-green-400">{p.name}</h3>

              <button
                onClick={() => toggleVisibility(i)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                {visible[i] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {p.twitter && <p>🐦 {visible[i] ? p.twitter : mask(p.twitter)}</p>}
              {p.discord && <p>💬 {visible[i] ? p.discord : mask(p.discord)}</p>}
              {p.telegram && <p>📢 {visible[i] ? p.telegram : mask(p.telegram)}</p>}
              {p.wallet && <p>💰 {visible[i] ? p.wallet : mask(p.wallet)}</p>}
              {p.email && <p>📧 {visible[i] ? p.email : mask(p.email)}</p>}
              {p.github && (
                <p>
                  <Github size={14} className="inline mr-1" />
                  {visible[i] ? p.github : mask(p.github)}
                </p>
              )}
              {p.website && (
                <p>
                  🌐{" "}
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

              {/* ✅ Daily Check toggle */}
              <button
                onClick={() => toggleDaily(i)}
                className="absolute bottom-3 right-3 text-cyan-400 hover:scale-110 transition-transform"
                title="Tandai Daily"
              >
                {dailyStatus[i] ? (
                  <CheckCircle size={22} className="text-green-400" />
                ) : (
                  <Circle size={22} className="text-gray-500" />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
