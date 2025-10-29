import React, { useEffect, useState, useRef } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [coins, setCoins] = useState([]);
  const [timer, setTimer] = useState(60);
  const [progress, setProgress] = useState(100);
  const [showDex, setShowDex] = useState(false);
  const dexRef = useRef(null);

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

  // === FETCH COIN MARKET ===
  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.warn("⚠️ Gagal ambil data market, gunakan dummy.");
      setCoins([
        {
          id: "bitcoin",
          name: "Bitcoin",
          current_price: 68000,
          price_change_percentage_24h: 1.2,
          image:
            "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          sparkline_in_7d: {
            price: Array.from({ length: 30 }, (_, i) => 67000 + i * 10),
          },
        },
        {
          id: "ethereum",
          name: "Ethereum",
          current_price: 2500,
          price_change_percentage_24h: -0.5,
          image:
            "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
          sparkline_in_7d: {
            price: Array.from({ length: 30 }, (_, i) => 2400 + i * 5),
          },
        },
      ]);
    }
  };

  // === AUTO REFRESH TIMER + PROGRESS BAR ===
  useEffect(() => {
    fetchMarket();
    const refreshInterval = setInterval(() => {
      fetchMarket();
      setTimer(60);
      setProgress(100);
    }, 60000);

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 60));
      setProgress((prev) => (prev > 0 ? prev - 100 / 60 : 100));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdown);
    };
  }, []);

  // === CLOSE DEX DROPDOWN WHEN CLICK OUTSIDE ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dexRef.current && !dexRef.current.contains(e.target)) {
        setShowDex(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const progressColor =
    timer > 40 ? "#22c55e" : timer > 20 ? "#facc15" : "#ef4444";

  // === FILTER & SORT ===
  const filteredProjects = projects
    .filter((p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 3);

  // === DEX LIST ===
  const dexList = [
    { name: "Uniswap", logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
    { name: "PancakeSwap", logo: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png" },
    { name: "Raydium", logo: "https://cryptologos.cc/logos/raydium-ray-logo.png" },
    { name: "SushiSwap", logo: "https://cryptologos.cc/logos/sushiswap-sushi-logo.png" },
    { name: "TraderJoe", logo: "https://cryptologos.cc/logos/traderjoe-joe-logo.png" },
    { name: "QuickSwap", logo: "https://cryptologos.cc/logos/quickswap-quick-logo.png" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <NeonParticles />

      {/* HEADER */}
      <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          🚀 Airdrop <span className="text-pink-400">Tracker</span>
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 relative">
          {/* === DEX DROPDOWN BUTTON === */}
          <div className="relative" ref={dexRef}>
            <button
              onClick={() => setShowDex(!showDex)}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-all"
            >
              List DEX
            </button>

            {showDex && (
              <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl animate-fadeIn">
                {dexList.map((dex) => (
                  <div
                    key={dex.name}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm text-gray-300 hover:text-cyan-300 transition"
                  >
                    <img
                      src={dex.logo}
                      alt={dex.name}
                      className="w-5 h-5 rounded-full"
                    />
                    {dex.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === SEARCH + FILTER === */}
          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 w-48 sm:w-60"
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

      {/* FORM INPUT */}
      <div className="relative z-10 bg-gray-900/60 p-6 rounded-2xl max-w-5xl mx-auto mb-8 shadow-lg w-[90%] md:w-auto">
        <h2 className="text-xl font-semibold mb-4 text-cyan-300 text-center md:text-left">
          ➕ Tambah Project Baru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

      {/* PROJECT LIST */}
      <div className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6 animate-fadeIn">
        {displayedProjects.map((p, i) => (
          <div
            key={i}
            className="relative bg-gray-900/70 backdrop-blur-md p-5 rounded-2xl border border-gray-700 hover:border-cyan-500 transition-all shadow-lg hover:shadow-cyan-700/30 hover:-translate-y-1"
          >
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

      {/* READ MORE / LESS */}
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

      {/* LIVE CHART + TIMER */}
      <div className="relative z-10 mt-16 px-6 pb-10">
        <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          📈 Live Crypto Market
        </h2>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm mb-2">
            ⏱️ Auto-refresh in{" "}
            <span className="text-cyan-400 font-semibold">{timer}s</span>
          </p>
          <div className="w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: progressColor,
              }}
            ></div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="bg-gray-900/70 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/60 shadow-lg hover:-translate-y-1 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                  />
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
    </div>
  );
}

export default TrackerPage;
