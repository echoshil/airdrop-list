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
  Zap,
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
import MultisendTool from "./components/MultisendTool";

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

// simple mapping from tag id -> hex color (used for inline gradient fallbacks)
const TAG_COLORS = {
  defi: "#3b82f6",       // blue-500
  gamefi: "#a78bfa",     // purple-400/500-ish
  layer2: "#10b981",     // green-500
  nft: "#ec4899",        // pink-500
  meme: "#f59e0b",       // yellow-500
  infra: "#06b6d4",      // cyan-500
  social: "#fb923c",     // orange-400
  bridge: "#6366f1",     // indigo-500
  dex: "#ef4444",        // red-500
  lending: "#14b8a6",    // teal-500
};

function getNativeSymbolForNetwork(net) {
  if (!net) return "ETH";
  if (net === "BSC") return "BNB";
  if (net === "Polygon") return "MATIC";
  // default to ETH for other EVM-compatible nets
  return "ETH";
}

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
  
  // State untuk EVM Native & Tokens Balance Checker
  const [evmAddresses, setEvmAddresses] = useState("");
  const [evmBalances, setEvmBalances] = useState([]);
  const [evmBalanceLoading, setEvmBalanceLoading] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState("");
  const [checkType, setCheckType] = useState("native");
  const [tokenContractAddress, setTokenContractAddress] = useState("");
  
  // State untuk Quick Network Balance Checker
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [quickAddresses, setQuickAddresses] = useState("");
  const [quickBalances, setQuickBalances] = useState([]);
  const [quickBalanceLoading, setQuickBalanceLoading] = useState(false);
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  const [filterDaily, setFilterDaily] = useState("all");
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    farcaster: "",
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
          farcaster: "",
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
      
      const matchesDaily =
        filterDaily === "all" ||
        (filterDaily === "checked" && p.daily === "CHECKED") ||
        (filterDaily === "unchecked" && p.daily !== "CHECKED");
      
      if (filterTag !== "all") {
        console.log(`Project: ${p.name}, Tags: ${JSON.stringify(p.tags)}, FilterTag: ${filterTag}, Matches: ${matchesTags}`);
      }
      
      return matchesSearch && matchesTags && matchesDaily;
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
    const list = quickAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");
    
    setQuickBalanceLoading(true);
    setQuickBalances([]);
    const result = [];
    
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      
      for (const addr of list) {
        try {
          // ethers.isAddress might be available depending on ethers version.
          // If your ethers version requires ethers.utils.isAddress, change accordingly.
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
      setQuickBalances(result);
      setQuickBalanceLoading(false);
    }
  };

  const checkEVMBalances = async () => {
    const list = evmAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");
    
    if (!customRpcUrl) return alert("Masukkan RPC URL!");
    
    if (checkType === "token" && !tokenContractAddress) {
      return alert("Masukkan contract address token!");
    }
    
    setEvmBalanceLoading(true);
    setEvmBalances([]);
    const result = [];
    
    try {
      const provider = new ethers.JsonRpcProvider(customRpcUrl);
      
      if (checkType === "native") {
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
      } else if (checkType === "token") {
        if (!ethers.isAddress(tokenContractAddress)) {
          alert("❌ Invalid token contract address!");
          setEvmBalanceLoading(false);
          return;
        }
        
        const tokenABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)"
        ];
        
        try {
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, provider);
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();
          
          for (const addr of list) {
            try {
              if (!ethers.isAddress(addr)) {
                result.push({ 
                  address: addr, 
                  balance: "❌ Invalid Address",
                  symbol: symbol 
                });
                continue;
              }
              
              const checksumAddr = ethers.getAddress(addr);
              const bal = await tokenContract.balanceOf(checksumAddr);
              const formattedBalance = parseFloat(ethers.formatUnits(bal, decimals)).toFixed(6);
              
              result.push({ 
                address: checksumAddr, 
                balance: formattedBalance,
                symbol: symbol
              });
            } catch (err) {
              console.error(`Error checking ${addr}:`, err);
              result.push({ 
                address: addr, 
                balance: "❌ Error",
                symbol: symbol
              });
            }
          }
        } catch (err) {
          console.error("Token contract error:", err);
          alert("⚠️ Gagal membaca token contract. Pastikan contract address benar!");
          setEvmBalanceLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert("⚠️ Gagal terhubung ke RPC URL. Pastikan URL benar dan mendukung jaringan EVM!");
    } finally {
      setEvmBalances(result);
      setEvmBalanceLoading(false);
    }
  };

  const sidebarMenuItems = [
    { id: "projects", label: "Projects", icon: LayoutDashboard, color: "text-cyan-400" },
    { id: "trading", label: "Trading", icon: Zap, color: "text-green-500" },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-purple-400" },
    { id: "gas", label: "Gas Tracker", icon: Fuel, color: "text-orange-400" },
    { id: "roi", label: "ROI Calculator", icon: Calculator, color: "text-green-400" },
    { id: "news", label: "News Feed", icon: Newspaper, color: "text-yellow-400" },
    { id: "balance", label: "Balance Checker", icon: Wallet, color: "text-blue-400" },
    { id: "multisend", label: "Multisend", icon: Send, color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out border ${
                      activeView === item.id
                        ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-cyan-500/50 text-white shadow-lg"
                        : "border-transparent text-gray-400 hover:bg-gray-800 hover:text-white"
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
        <div className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-700 px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-wrap justify-between items-center gap-3 md:gap-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {activeView === "projects" && "📦 My Projects"}
              {activeView === "trading" && "⚡ DeDoo Trading Platform"}
              {activeView === "analytics" && "📊 Analytics Dashboard"}
              {activeView === "gas" && "⛽ Gas Tracker"}
              {activeView === "roi" && "💹 ROI Calculator"}
              {activeView === "news" && "📰 News Feed"}
              {activeView === "balance" && "💰 Balance Checker"}
              {activeView === "multisend" && "🚀 Multisend Native & Tokens"}
            </h1>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {activeView === "projects" && (
                <>
                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 bg-gray-800 hover:bg-gray-700 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition text-xs md:text-sm">
                      <Tag size={14} />
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-gray-800 text-white outline-none cursor-pointer border-none appearance-none pr-2"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-gray-800 text-white">All Tags</option>
                        {AVAILABLE_TAGS.map((tag) => (
                          <option key={tag.id} value={tag.id} className="bg-gray-800 text-white">
                            {tag.label}
                          </option>
                        ))}
                      </select>
                    </button>
                  </div>

                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 bg-gray-800 hover:bg-gray-700 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition text-xs md:text-sm">
                      <CheckSquare size={14} />
                      <select
                        value={filterDaily}
                        onChange={(e) => setFilterDaily(e.target.value)}
                        className="bg-gray-800 text-white outline-none cursor-pointer border-none appearance-none pr-2"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-gray-800 text-white">All Projects</option>
                        <option value="checked" className="bg-gray-800 text-white">✅ Daily Checked</option>
                        <option value="unchecked" className="bg-gray-800 text-white">⬜ Daily Unchecked</option>
                      </select>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 w-28 md:w-48 text-xs md:text-sm"
                  />

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-1 md:gap-2 bg-gray-800 hover:bg-gray-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm"
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
                  </button>

                  <button
                    onClick={() => setHideData(!hideData)}
                    className="bg-gray-800 hover:bg-gray-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                  >
                    {hideData ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeView === "trading" && (
            <div className="max-w-full mx-auto space-y-6">
              {/* ... (content unchanged) */}
            </div>
          )}

          {activeView === "projects" && (
            <div className="space-y-8">
              {/* ... (content unchanged, except tag color usage below) */}
              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {displayedProjects.map((p, i) => (
                  <div key={i} className="group relative p-6 transition-all duration-500 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, #e8f1f8 0%, #dae7f3 100%)",
                      boxShadow: "15px 15px 40px #c5d4e0, -15px -15px 40px #ffffff",
                      transition: "all 0.5s ease"
                    }}>
                    {/* ... */}
                    {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.tags.map((tagId) => {
                          const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                          const colorHex = TAG_COLORS[tagId] || "#64748b";
                          return tag ? (
                            <span
                              key={tagId}
                              className="text-white text-xs px-3 py-1.5 rounded-full font-semibold"
                              style={{
                                background: `linear-gradient(135deg, ${colorHex}, ${colorHex})`,
                                boxShadow: "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 8px rgba(255,255,255,0.5)"
                              }}
                            >
                              {tag.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    {/* ... */}
                  </div>
                ))}
              </div>
              {/* ... */}
            </div>
          )}

          {activeView === "balance" && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* EVM Native & Tokens Balance Checker */}
              {/* ... (unchanged) */}

              {/* Default Network Balance Checker */}
              <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  💰 Quick Network Balance Checker
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {Object.keys(NETWORKS).map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedNetwork(net)}
                      className={`px-4 py-2 rounded-lg text-sm md:text-base transition ${
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
                  placeholder="Paste wallet addresses (one per line)&#10;Example:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                  rows="8"
                  value={quickAddresses}
                  onChange={(e) => setQuickAddresses(e.target.value)}
                ></textarea>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <button
                    onClick={checkBalances}
                    disabled={quickBalanceLoading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition ${
                      quickBalanceLoading
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {quickBalanceLoading ? "⏳ Checking..." : "✅ Check Balance"}
                  </button>
                  {quickBalances.length > 0 && (
                    <span className="text-sm text-gray-400">
                      Total: {quickBalances.length} address(es) checked
                    </span>
                  )}
                </div>

                {quickBalances.length > 0 && (
                  <div className="mt-6 bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-cyan-400 font-semibold">Results - {selectedNetwork}</h3>
                      <button
                        onClick={() => setQuickBalances([])}
                        className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-cyan-400 border-b border-gray-700">
                            <th className="p-2">#</th>
                            <th className="p-2">Address</th>
                            <th className="p-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quickBalances.map((b, i) => {
                            const nativeSymbol = getNativeSymbolForNetwork(selectedNetwork);
                            const isError = (b.balance + "").includes("Error") || (b.balance + "").includes("Invalid");
                            const numeric = parseFloat(b.balance);
                            const positive = !isNaN(numeric) && numeric > 0;
                            return (
                              <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                                <td className="p-2 text-gray-400">{i + 1}</td>
                                <td className="p-2 break-all font-mono text-xs">{b.address}</td>
                                <td className={`p-2 text-right font-semibold ${
                                  isError ? 'text-red-400' : positive ? 'text-green-400' : 'text-gray-400'
                                }`}>
                                  {isError ? b.balance : `${b.balance} ${nativeSymbol}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 text-right">
                      Total Balance: {quickBalances
                        .filter(b => !( (b.balance+"").includes('Error') || (b.balance+"").includes('Invalid')))
                        .reduce((sum, b) => {
                          const n = parseFloat(b.balance);
                          return sum + (isNaN(n) ? 0 : n);
                        }, 0)
                        .toFixed(6)} {getNativeSymbolForNetwork(selectedNetwork)}
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
                balances={quickBalances}
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

          {activeView === "multisend" && (
            <div className="max-w-7xl mx-auto">
              <MultisendTool />
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
