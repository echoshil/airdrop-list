import React, { useEffect, useState } from "react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function App() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dailyStatus, setDailyStatus] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
  });

  // ✅ Ambil data dari Google Sheets
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
        setFiltered(data);
        setLastUpdate(new Date().toLocaleString());
      }
    } catch (err) {
      console.error("Gagal ambil data:", err);
      alert("⚠️ Gagal load data dari Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Simpan dan reset checklist harian
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const saved = JSON.parse(localStorage.getItem("dailyStatus") || "{}");
    if (saved.date !== today) {
      setDailyStatus({ date: today, done: {} });
      localStorage.setItem(
        "dailyStatus",
        JSON.stringify({ date: today, done: {} })
      );
    } else {
      setDailyStatus(saved);
    }
  }, []);

  const toggleDailyDone = (projectName) => {
    const newStatus = { ...dailyStatus };
    newStatus.done[projectName] = !newStatus.done[projectName];
    setDailyStatus(newStatus);
    localStorage.setItem("dailyStatus", JSON.stringify(newStatus));
  };

  // 🔍 Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.twitter?.toLowerCase().includes(q) ||
          p.discord?.toLowerCase().includes(q) ||
          p.telegram?.toLowerCase().includes(q)
      )
    );
  }, [search, projects]);

  // ⚙️ Sorting
  const sortProjects = (key) => {
    const newOrder =
      sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(newOrder);
    const sorted = [...filtered].sort((a, b) => {
      if (key === "name") {
        return newOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (key === "date" && a.DAILYSTATUS && b.DAILYSTATUS) {
        return newOrder === "asc"
          ? new Date(a.DAILYSTATUS) - new Date(b.DAILYSTATUS)
          : new Date(b.DAILYSTATUS) - new Date(a.DAILYSTATUS);
      }
      return 0;
    });
    setFiltered(sorted);
  };

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
          website: "",
        });
      } else {
        alert("⚠️ Format respon tidak sesuai. Cek Apps Script.");
      }
    } catch (error) {
      console.error("Gagal kirim data:", error);
      alert("❌ Gagal mengirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        🚀 Airdrop Tracker by Ikiw97
      </h1>

      {/* ➕ Form Tambah Project */}
      <div className="bg-gray-800/70 backdrop-blur-md p-4 rounded-lg mb-6 border border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold mb-3">Tambah Project Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {["name", "twitter", "discord", "telegram", "wallet", "email", "website"].map(
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

      {/* 🔍 Search + Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <input
          type="text"
          placeholder="🔍 Cari project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded bg-gray-800 w-full md:w-1/3 text-white"
        />
        <div className="flex gap-2">
          <button
            onClick={() => sortProjects("name")}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Urutkan Nama {sortOrder === "asc" ? "↓" : "↑"}
          </button>
          <button
            onClick={() => sortProjects("date")}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded"
          >
            Urutkan Tanggal
          </button>
        </div>
      </div>

      {/* 🕒 Info Update */}
      {lastUpdate && (
        <p className="text-sm text-gray-400 mb-4 text-right">
          Terakhir diperbarui: {lastUpdate}
        </p>
      )}

      {/* 📋 Daftar Project */}
      {filtered.length === 0 ? (
        <p className="text-gray-400">Belum ada data project.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <div
              key={i}
              className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-lg hover:border-cyan-400 transition-all"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-2">{p.name}</h3>
              {p.twitter && <p>🐦 Twitter: {p.twitter}</p>}
              {p.discord && <p>💬 Discord: {p.discord}</p>}
              {p.telegram && <p>📢 Telegram: {p.telegram}</p>}
              {p.wallet && <p>💰 Wallet: {p.wallet}</p>}
              {p.email && <p>📧 Email: {p.email}</p>}
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
              {/* ✅ Daily Checklist */}
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!dailyStatus.done?.[p.name]}
                    onChange={() => toggleDailyDone(p.name)}
                    className="accent-cyan-400"
                  />
                  <span className="text-sm text-gray-300">
                    Sudah dikerjakan hari ini
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
