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
  ExternalLink,
  Tag,
  StickyNote,
  Filter,
  X,
  Menu,
  ChevronLeft,
  Activity,
  Fuel,
  Calculator,
  Newspaper,
  LayoutDashboard,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";
import NeonParticles from "./NeonParticles";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import GasTracker from "./components/GasTracker";
import ROICalculator from "./components/ROICalculator";
import NewsAggregator from "./components/NewsAggregator";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const DEX_LIST = [
  { name: "Uniswap", logo: "/dex/uniswap.png", link: "https://app.uniswap.org" },
  { name: "PancakeSwap", logo: "/dex/pancakeswap.png", link: "https://pancakeswap.finance" },
  { name: "Raydium", logo: "/dex/raydium.png", link: "https://raydium.io" },
  { name: "SushiSwap", logo: "/dex/sushiswap.png", link: "https://www.sushi.com" },
  { name: "QuickSwap", logo: "/dex/quickswap.png", link: "https://quickswap.exchange" },
];

const NETWORKS = {
  Ethereum: { rpc: "https://eth.llamarpc.com" },
  Polygon: { rpc: "https://polygon-rpc.com" },
  BSC: { rpc: "https://bsc-dataseed.binance.org" },
  Arbitrum: { rpc: "https://arb1.arbitrum.io/rpc" },
  Base: { rpc: "https://mainnet.base.org" },
};

const AVAILABLE_TAGS = [
  { id: "defi", label: "DeFi", color: "bg-blue-500" },
  { id: "gamefi", label: "GameFi", color: "bg-purple-500" },
  { id: "layer2", label: "Layer2", color: "bg-green-500" },
  { id: "nft", label: "NFT", color: "bg-pink-500" },
  { id: "meme", label: "Meme", color: "bg-yellow-500" },
  { id: "infra", label: "Infrastructure", color: "bg-cyan-500" },
  { id: "social", label: "SocialFi", color: "bg-orange-500" },
  { id: "bridge", label: "Bridge", color: "bg-indigo-500" },
  { id: "dex", label: "DEX", color: "bg-red-500" },
  { id: "lending", label: "Lending", color: "bg-teal-500" },
];

function TrackerPageFullScreen({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideData, setHideData] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [coins, setCoins] = useState([]);
  const [timer, setTimer] = useState(60);
  const [progress, setProgress] = useState(100);
  const [showDexList, setShowDexList] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [addresses, setAddresses] = useState("");
  const [balances, setBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    github: "",
    website: "",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      console.log("Raw data from Google Sheets:", data);
      
      if (Array.isArray(data)) {
        const parsedData = data.map(project => {
          let parsedTags = [];
          
          if (project.tags) {
            if (typeof project.tags === 'string') {
              const trimmed = project.tags.trim();
              if (trimmed) {
                try {
                  parsedTags = JSON.parse(trimmed);
                  if (!Array.isArray(parsedTags)) {
                    parsedTags = [parsedTags];
                  }
                } catch (e) {
                  console.error("Failed to parse tags for project:", project.name, "tags value:", project.tags);
                  parsedTags = [];
                }
              }
            } else if (Array.isArray(project.tags)) {
              parsedTags = project.tags;
            }
          }
          
          return {
            ...project,
            tags: parsedTags,
            notes: project.notes || ""
          };
        });
        
        console.log("Parsed data with tags:", parsedData);
        setProjects(parsedData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("⚠️ Gagal memuat data dari Google Sheets");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        tags: JSON.stringify(formData.tags || [])
      };
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dataToSend),
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
          notes: "",
          tags: [],
        });
        setSelectedTags([]);
      }
    } catch {
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

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

  const deleteProject = async (name) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus project "${name}"?`);
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "delete",
          name: name,
        }),
      });
      const text = await res.text();
      if (text.toLowerCase().includes("ok") || text.toLowerCase().includes("deleted")) {
        alert("✅ Project berhasil dihapus!");
        fetchProjects();
      } else {
        alert("⚠️ Gagal menghapus project!");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("❌ Gagal menghapus project!");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch {
      setCoins([]);
    }
  };

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

  const progressColor =
    timer > 40 ? "#22c55e" : timer > 20 ? "#facc15" : "#ef4444";

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const hasTags = p.tags && Array.isArray(p.tags);
      const matchesTags =
        filterTag === "all" ||
        (hasTags && p.tags.includes(filterTag));
      
      if (filterTag !== "all") {
        console.log(`Project: ${p.name}, Tags: ${JSON.stringify(p.tags)}, FilterTag: ${filterTag}, Matches: ${matchesTags}`);
      }
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 3);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];
      
      setFormData((prevForm) => ({
        ...prevForm,
        tags: newTags,
      }));
      
      return newTags;
    });
  };

  const checkBalances = async () => {
    const list = addresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");
    
    setBalanceLoading(true);
    setBalances([]);
    const result = [];
    
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      
      for (const addr of list) {
        try {
          if (!ethers.isAddress(addr)) {
            result.push({ 
              address: addr, 
              balance: "❌ Invalid Address" 
            });
            continue;
          }
          
          const checksumAddr = ethers.getAddress(addr);
          const bal = await provider.getBalance(checksumAddr);
          const formattedBalance = parseFloat(ethers.formatEther(bal)).toFixed(6);
          
          result.push({ 
            address: checksumAddr, 
            balance: formattedBalance 
          });
        } catch (err) {
          console.error(`Error checking ${addr}:`, err);
          result.push({ 
            address: addr, 
            balance: "❌ Error" 
          });
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert(`⚠️ Gagal terhubung ke ${selectedNetwork} network. Coba lagi!`);
    } finally {
      setBalances(result);
      setBalanceLoading(false);
    }
  };

  const sidebarMenuItems = [
    { id: "projects", label: "Projects", icon: LayoutDashboard, color: "text-cyan-400" },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-purple-400" },
    { id: "gas", label: "Gas Tracker", icon: Fuel, color: "text-orange-400" },
    { id: "roi", label: "ROI Calculator", icon: Calculator, color: "text-green-400" },
    { id: "news", label: "News Feed", icon: Newspaper, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <NeonParticles />

      <div
        className={`fixed top-0 left-0 h-full bg-gray-900/95 backdrop-blur-md border-r border-gray-700 z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } ${isMobile ? "shadow-2xl" : ""}`}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                🚀 Airdrop Tracker
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white transition lg:hidden"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-2">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeView === item.id
                        ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/50 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon size={20} className={activeView === item.id ? item.color : ""} />
                    <span className="font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-700">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg shadow-lg transition"
        >
          <Menu size={24} />
        </button>
      )}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        <div className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-700 px-6 py-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {activeView === "projects" && "📦 My Projects"}
              {activeView === "analytics" && "📊 Analytics Dashboard"}
              {activeView === "gas" && "⛽ Gas Tracker"}
              {activeView === "roi" && "💹 ROI Calculator"}
              {activeView === "news" && "📰 News Feed"}
            </h1>

            <div className="flex items-center gap-3">
              {activeView === "projects" && (
                <>
                  <div className="relative">
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition text-sm">
                      <Filter size={16} />
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-transparent text-white outline-none cursor-pointer"
                      >
                        <option value="all">All Tags</option>
                        {AVAILABLE_TAGS.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.label}
                          </option>
                        ))}
                      </select>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 w-48 text-sm"
                  />

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm"
                  >
                    <ArrowUpDown size={16} />
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </button>

                  <button
                    onClick={() => setHideData(!hideData)}
                    className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    {hideData ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeView === "projects" && (
            <div className="space-y-8">
              <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">
                  ➕ Tambah Project Baru
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <StickyNote size={16} />
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white resize-none"
                    rows="2"
                  ></textarea>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Tag size={16} />
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? `${tag.color} text-white`
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
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

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedProjects.map((p, i) => (
                  <div
                    key={i}
                    className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-6 rounded-3xl border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 pr-16">
                          {p.name}
                        </h3>
                      </div>
                      
                      <div className="flex gap-2 absolute top-4 right-4">
                        <button
                          onClick={() => toggleDaily(p.name, p.daily)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            p.daily === "CHECKED"
                              ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-cyan-400"
                          }`}
                          title="Toggle Daily Check"
                        >
                          {p.daily === "CHECKED" ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <button
                          onClick={() => deleteProject(p.name)}
                          className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                          title="Hapus Project"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.tags.map((tagId) => {
                          const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                          return tag ? (
                            <span
                              key={tagId}
                              className={`${tag.color} text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg`}
                            >
                              {tag.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {p.notes && (
                      <div className="mb-4 p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                        <p className="flex items-start gap-2 text-sm text-gray-200">
                          <StickyNote size={16} className="mt-0.5 text-yellow-400 flex-shrink-0" />
                          <span className="italic leading-relaxed">{p.notes}</span>
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-700/50 my-4"></div>

                    <div className="space-y-3">
                      {p.twitter && (
                        <div className="flex items-center gap-3 group/item hover:bg-blue-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover/item:bg-blue-500/20 transition-colors">
                            <Twitter size={14} className="text-blue-400"/>
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{hideData ? "••••••" : p.twitter}</span>
                        </div>
                      )}
                      
                      {p.discord && (
                        <div className="flex items-center gap-3 group/item hover:bg-indigo-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover/item:bg-indigo-500/20 transition-colors">
                            <MessageCircle size={14} className="text-indigo-400"/>
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{hideData ? "••••••" : p.discord}</span>
                        </div>
                      )}
                      
                      {p.telegram && (
                        <div className="flex items-center gap-3 group/item hover:bg-sky-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-sky-500/10 rounded-lg group-hover/item:bg-sky-500/20 transition-colors">
                            <Send size={14} className="text-sky-400"/>
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{hideData ? "••••••" : p.telegram}</span>
                        </div>
                      )}
                      
                      {p.wallet && (
                        <div className="flex items-center gap-3 group/item hover:bg-yellow-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-yellow-500/10 rounded-lg group-hover/item:bg-yellow-500/20 transition-colors">
                            <Wallet size={14} className="text-yellow-400"/>
                          </div>
                          <span className="text-xs text-gray-300 font-mono break-all">{hideData ? "••••••••••••••" : p.wallet}</span>
                        </div>
                      )}
                      
                      {p.email && (
                        <div className="flex items-center gap-3 group/item hover:bg-pink-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-pink-500/10 rounded-lg group-hover/item:bg-pink-500/20 transition-colors">
                            <Mail size={14} className="text-pink-400"/>
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{hideData ? "••••••" : p.email}</span>
                        </div>
                      )}
                      
                      {p.github && (
                        <div className="flex items-center gap-3 group/item hover:bg-gray-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-gray-500/10 rounded-lg group-hover/item:bg-gray-500/20 transition-colors">
                            <Github size={14} className="text-gray-300"/>
                          </div>
                          <span className="text-sm text-gray-300 font-mono truncate">{hideData ? "••••••" : p.github}</span>
                        </div>
                      )}
                      
                      {p.website && (
                        <div className="flex items-center gap-3 group/item hover:bg-blue-500/5 p-2 rounded-lg transition-colors">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover/item:bg-blue-500/20 transition-colors">
                            <Globe size={14} className="text-blue-400"/>
                          </div>
                          <a 
                            href={p.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-400 hover:text-blue-300 underline truncate transition-colors"
                          >
                            {p.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {p.lastupdate && (
                      <div className="mt-4 pt-3 border-t border-gray-700/30">
                        <p className="text-xs text-gray-500 text-center">
                          Last update: {new Date(p.lastupdate).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredProjects.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-semibold transition"
                  >
                    {showAll ? "⬆️ Show Less" : "⬇️ Show More"}
                  </button>
                </div>
              )}

              <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  📈 Live Crypto Market
                </h2>

                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm mb-2">
                    ⏱️ Auto-refresh in <span className="text-cyan-400 font-semibold">{timer}s</span>
                  </p>
                  <div className="w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    ></div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coins.map((coin) => (
                    <div key={coin.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/60 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <span className="font-semibold">{coin.name}</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2 text-sm">
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}>
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

              <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  💰 Bulk Wallet Balance Checker
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {Object.keys(NETWORKS).map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedNetwork(net)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedNetwork === net
                          ? "bg-cyan-600"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white resize-none focus:border-cyan-400 focus:outline-none"
                  placeholder="Paste wallet addresses (one per line)"
                  rows="6"
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                ></textarea>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={checkBalances}
                    disabled={balanceLoading}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      balanceLoading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {balanceLoading ? "⏳ Checking..." : "✅ Check Balance"}
                  </button>
                  {balances.length > 0 && (
                    <span className="text-sm text-gray-400">
                      Total: {balances.length} address(es)
                    </span>
                  )}
                </div>

                {balances.length > 0 && (
                  <div className="mt-6 bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-cyan-400 font-semibold">Results - {selectedNetwork}</h3>
                      <button
                        onClick={() => setBalances([])}
                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                      >
                        Clear
                      </button>
                    </div>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-cyan-400 border-b border-gray-700">
                          <th className="p-2">#</th>
                          <th className="p-2">Address</th>
                          <th className="p-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balances.map((b, i) => (
                          <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                            <td className="p-2 text-gray-400">{i + 1}</td>
                            <td className="p-2 break-all font-mono text-xs">{b.address}</td>
                            <td className={`p-2 text-right font-semibold ${
                              b.balance.includes('Error') || b.balance.includes('Invalid') 
                                ? 'text-red-400' 
                                : parseFloat(b.balance) > 0 
                                ? 'text-green-400' 
                                : 'text-gray-400'
                            }`}>
                              {b.balance.includes('Error') || b.balance.includes('Invalid') 
                                ? b.balance 
                                : `${b.balance} ${selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}`
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 text-xs text-gray-400 text-right">
                      Total: {balances
                        .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                        .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                        .toFixed(6)} {selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "analytics" && (
            <div className="max-w-7xl mx-auto">
              <AnalyticsDashboard 
                projects={projects} 
                balances={balances}
                selectedNetwork={selectedNetwork}
              />
            </div>
          )}

          {activeView === "gas" && (
            <div className="max-w-7xl mx-auto">
              <GasTracker />
            </div>
          )}

          {activeView === "roi" && (
            <div className="max-w-7xl mx-auto">
              <ROICalculator />
            </div>
          )}

          {activeView === "news" && (
            <div className="max-w-7xl mx-auto">
              <NewsAggregator />
            </div>
          )}
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default TrackerPageFullScreen;
