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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import NeonParticles from "./NeonParticles";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function TrackerPage({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideData, setHideData] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
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

  // ✅ Fetch data Google Sheets
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Gagal load data:", err);
      alert("⚠️ Gagal memuat data dari Google Sheets. Periksa URL Script.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Tambah project
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
        alert("⚠️ Data sudah terkirim, tapi format respon tidak sesuai.");
      }
    } catch (err) {
      console.error("Gagal kirim:", err);
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sorting
  const sortedProjects = [...projects].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return sortOrder === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  // ✅ Fetch CoinGecko Market
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
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <NeonParticles />

      {/* Header */}
      <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🚀 Airdrop Tracker
        </h1>

        <div className="flex items-center gap-3 mt-3 md:mt-0">
          <button
            onClick={() =>
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
            }
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

      {/* Form Input */}
      <div className="relative z-10 bg-gray-900/60 p-6 rounded-2xl max-w-5xl mx-auto mb-8 shadow-lg">
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
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white w-full"
            />
          ))}
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

      {/* Project List */}
      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-6">
        {sortedProjects.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            Belum ada project.
          </p>
        ) : (
          sortedProjects.map((p, i) => (
            <div
              key={i}
              className="bg-gray-900/70 backdrop-blur-md p-5 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all shadow-lg"
            >
              <h3 className="text-lg font-bold text-cyan-400 mb-3">
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
                <p className="flex items-center gap-2 text-yellow-400">
                  <Wallet size={18} />
                  <span className="truncate">{hideData ? "••••••••" : p.wallet}</span>
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
                  <Github className="text-white" size={18} />
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
                    className="underline hover:text-blue-300"
                  >
                    {p.website}
                  </a>
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 📊 Live Market Chart */}
      <div className="relative z-10 mt-16 px-6">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          📈 Live Crypto Market
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="bg-gray-900/70 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-400/10 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <span className="font-semibold">{coin.name}</span>
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
              <p className="text-gray-300 mb-2 text-sm">
                ${coin.current_price.toLocaleString()}
              </p>

              <ResponsiveContainer width="100%" height={60}>
                <LineChart
                  data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}
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
                    contentStyle={{ background: "#111", border: "none" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrackerPage;
