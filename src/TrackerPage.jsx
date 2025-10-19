// src/TrackerPage.jsx
import React, { useEffect, useState } from "react";
import NeonParticles from "./NeonParticles";
import { Github, Eye, EyeOff, LogOut, SortAsc, SortDesc } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function TrackerPage({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hide, setHide] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const [view, setView] = useState("tracker"); // tracker or market
  const [coins, setCoins] = useState([]);

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

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      alert("⚠️ Gagal load data dari Google Sheets!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch market
  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=9&page=1&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.error("Gagal ambil data market:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add project
  const addProject = async () => {
    if (!formData.name) {
      alert("Nama project wajib diisi!");
      return;
    }

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
          github: "",
          website: "",
        });
      } else {
        alert("⚠️ Cek kembali Apps Script URL kamu!");
      }
    } catch (error) {
      alert("❌ Gagal kirim data ke Google Script!");
    }
  };

  // Sorting
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortAsc) return a.name?.localeCompare(b.name || "");
    else return b.name?.localeCompare(a.name || "");
  });

  // Mask text
  const maskText = (text) => (text ? "•".repeat(Math.min(8, text.length)) : "");

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      <NeonParticles />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            🚀 Airdrop Tracker Web3
          </h1>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => setHide(!hide)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {hide ? <EyeOff size={18} /> : <Eye size={18} />}
              {hide ? "Hidden" : "Visible"}
            </button>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {sortAsc ? <SortAsc size={18} /> : <SortDesc size={18} />}
              {sortAsc ? "A-Z" : "Z-A"}
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-3">
          <button
            onClick={() => setView("tracker")}
            className={`px-4 py-2 rounded-lg ${
              view === "tracker"
                ? "bg-cyan-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            📋 Tracker
          </button>
          <button
            onClick={() => setView("market")}
            className={`px-4 py-2 rounded-lg ${
              view === "market"
                ? "bg-purple-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            📊 Market Chart
          </button>
        </div>

        {view === "tracker" ? (
          <>
            {/* Form */}
            <div className="bg-gray-800/70 p-6 rounded-xl mb-8">
              <h2 className="text-xl font-semibold mb-4">Tambah Project Baru</h2>
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
                    className="p-2 rounded bg-gray-900 border border-gray-700 text-white w-full"
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={addProject}
                  disabled={loading}
                  className={`${
                    loading
                      ? "bg-gray-600"
                      : "bg-green-600 hover:bg-green-700"
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

            {/* Projects */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedProjects.map((p, i) => (
                <div
                  key={i}
                  className="bg-gray-900/70 p-5 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all"
                >
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">
                    {p.name}
                  </h3>
                  {p.twitter && (
                    <p>🐦 Twitter: {hide ? maskText(p.twitter) : p.twitter}</p>
                  )}
                  {p.discord && (
                    <p>💬 Discord: {hide ? maskText(p.discord) : p.discord}</p>
                  )}
                  {p.telegram && (
                    <p>📢 Telegram: {hide ? maskText(p.telegram) : p.telegram}</p>
                  )}
                  {p.wallet && (
                    <p>💰 Wallet: {hide ? maskText(p.wallet) : p.wallet}</p>
                  )}
                  {p.email && (
                    <p>📧 Email: {hide ? maskText(p.email) : p.email}</p>
                  )}
                  {p.github && (
                    <p className="flex items-center gap-2">
                      <Github size={16} />{" "}
                      {hide ? maskText(p.github) : p.github}
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
          </>
        ) : (
          // Market View
          <div>
            <h2 className="text-xl font-semibold mb-6 text-center">
              📈 Live Crypto Market
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  className="bg-gray-900/70 p-5 rounded-xl border border-gray-700 hover:border-purple-500 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                      <span>{coin.name}</span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    ${coin.current_price.toLocaleString()}
                  </p>
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart
                      data={coin.sparkline_in_7d.price.map((p, i) => ({
                        i,
                        p,
                      }))}
                    >
                      <Line
                        type="monotone"
                        dataKey="p"
                        stroke={
                          coin.price_change_percentage_24h >= 0
                            ? "#22c55e"
                            : "#ef4444"
                        }
                        dot={false}
                        strokeWidth={2}
                      />
                      <XAxis hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          background: "#111",
                          border: "none",
                          color: "#fff",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackerPage;
