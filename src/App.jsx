import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Github } from "lucide-react";
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
    github: "",
    website: "",
  });
  const [visible, setVisible] = useState({}); // untuk menyimpan status show/hide tiap project

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

    if (!GOOGLE_SCRIPT_URL) {
      alert("❌ URL Google Script belum diset di .env!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // biar gak kena preflight CORS
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
          github: "",
          website: "",
        });
      } else {
        console.warn("Respon Apps Script:", text);
        alert("⚠️ Data sudah terkirim, tapi format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle visibility
  const toggleVisibility = (index) => {
    setVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const mask = (text) => {
    if (!text) return "-";
    return "•".repeat(10);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🚀 Airdrop Tracker</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Tambah Project Baru</h2>
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
                className="p-2 rounded bg-gray-700 text-white w-full"
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
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">📋 Daftar Project</h2>

      {projects.length === 0 ? (
        <p className="text-gray-400">Belum ada data project.</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((p, i) => (
            <div
              key={i}
              className="bg-gray-800 p-4 rounded-lg shadow flex flex-col gap-1 relative"
            >
              <h3 className="text-lg font-bold text-green-400">{p.name}</h3>
              
              <button
                onClick={() => toggleVisibility(i)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                {visible[i] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {p.twitter && (
                <p>🐦 Twitter: {visible[i] ? p.twitter : mask(p.twitter)}</p>
              )}
              {p.discord && (
                <p>💬 Discord: {visible[i] ? p.discord : mask(p.discord)}</p>
              )}
              {p.telegram && (
                <p>📢 Telegram: {visible[i] ? p.telegram : mask(p.telegram)}</p>
              )}
              {p.wallet && (
                <p>💰 Wallet: {visible[i] ? p.wallet : mask(p.wallet)}</p>
              )}
              {p.email && (
                <p>📧 Email: {visible[i] ? p.email : mask(p.email)}</p>
              )}
              {p.github && (
                <p>
                  <Github size={14} className="inline mr-1" />
                  GitHub: {visible[i] ? p.github : mask(p.github)}
                </p>
              )}
              {p.website && (
                <p>
                  🌐 Website:{" "}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
