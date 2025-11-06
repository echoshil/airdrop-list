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
    <div className="min-h-screen text-white relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #e3edf7 0%, #d4e4f7 50%, #dfe9f5 100%)"
    }}>
      {/* <NeonParticles /> */}

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
              <div className="text-center py-8 bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-md rounded-3xl border border-gray-700/50">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Zap className="text-green-400" size={48} />
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    DeDoo Trading Platform
                  </h2>
                </div>
                <p className="text-gray-300 text-lg">
                  Trade crypto with lightning speed & zero fees
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6 rounded-2xl border-2 border-green-500/40 hover:border-green-400/60 transition-all shadow-xl hover:shadow-green-500/20">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-green-500/30 rounded-xl">
                      <Zap className="text-green-300" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-green-300">Lightning Fast</h3>
                  </div>
                  <p className="text-gray-200 text-base leading-relaxed">
                    Execute trades in milliseconds with our optimized engine
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-6 rounded-2xl border-2 border-blue-500/40 hover:border-blue-400/60 transition-all shadow-xl hover:shadow-blue-500/20">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-blue-500/30 rounded-xl">
                      <Wallet className="text-blue-300" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-blue-300">Low Fees</h3>
                  </div>
                  <p className="text-gray-200 text-base leading-relaxed">
                    Trade with minimal fees and maximum profit potential
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 p-6 rounded-2xl border-2 border-purple-500/40 hover:border-purple-400/60 transition-all shadow-xl hover:shadow-purple-500/20">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-purple-500/30 rounded-xl">
                      <Activity className="text-purple-300" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-purple-300">Real-time Data</h3>
                  </div>
                  <p className="text-gray-200 text-base leading-relaxed">
                    Get live market data and advanced trading charts
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl p-6 rounded-3xl border-2 border-gray-700/50 shadow-2xl">
                <div className="relative w-full" style={{ height: 'calc(100vh - 450px)', minHeight: '650px' }}>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-gray-600/50 shadow-2xl">
                    <iframe
                      src="https://trade.dedoo.xyz/"
                      className="w-full h-full"
                      title="DeDoo Trading Platform"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <a 
                    href="https://trade.dedoo.xyz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
                  >
                    <Globe size={20} />
                    <span>Open in New Tab</span>
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <div className="space-y-8">
              <div className="p-4 md:p-8 rounded-3xl" style={{
                background: "linear-gradient(135deg, #e8f1f8 0%, #dae7f3 100%)",
                boxShadow: "20px 20px 60px #c5d4e0, -20px -20px 60px #ffffff"
              }}>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-700 flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{
                    background: "#e8f1f8",
                    boxShadow: "inset 6px 6px 12px #c5d4e0, inset -6px -6px 12px #ffffff"
                  }}>
                    ➕
                  </div>
                  Tambah Project Baru
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["name", "twitter", "discord", "telegram", "farcaster", "wallet", "email", "github", "website"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        className="p-3 md:p-4 text-sm md:text-base rounded-2xl outline-none text-gray-700 placeholder-gray-400 transition-all duration-300 w-full"
                        style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 6px 6px 12px #c5d4e0, inset -6px -6px 12px #ffffff"
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = "inset 8px 8px 16px #c5d4e0, inset -8px -8px 16px #ffffff";
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = "inset 6px 6px 12px #c5d4e0, inset -6px -6px 12px #ffffff";
                        }}
                      />
                    )
                  )}
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2 font-medium">
                    <StickyNote size={16} />
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 rounded-2xl text-gray-700 placeholder-gray-400 resize-none outline-none transition-all duration-300"
                    rows="3"
                    style={{
                      background: "#e8f1f8",
                      boxShadow: "inset 6px 6px 12px #c5d4e0, inset -6px -6px 12px #ffffff"
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = "inset 8px 8px 16px #c5d4e0, inset -8px -8px 16px #ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "inset 6px 6px 12px #c5d4e0, inset -6px -6px 12px #ffffff";
                    }}
                  ></textarea>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-3 font-medium">
                    <Tag size={16} />
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
                        style={{
                          background: selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? `linear-gradient(135deg, ${tag.color.replace('bg-', '#')}, ${tag.color.replace('bg-', '#')})`
                            : "#e8f1f8",
                          boxShadow: selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? "inset 4px 4px 8px #c5d4e0, inset -4px -4px 8px #ffffff"
                            : "6px 6px 12px #c5d4e0, -6px -6px 12px #ffffff",
                          color: selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? "white"
                            : "#64748b"
                        }}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addProject}
                  disabled={loading}
                  className="mt-6 px-8 py-3 rounded-2xl font-semibold text-gray-700 transition-all duration-300 active:scale-95"
                  style={{
                    background: "#e8f1f8",
                    boxShadow: loading ? "inset 4px 4px 8px #c5d4e0, inset -4px -4px 8px #ffffff" : "8px 8px 16px #c5d4e0, -8px -8px 16px #ffffff",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseDown={(e) => {
                    if (!loading) e.currentTarget.style.boxShadow = "inset 4px 4px 8px #c5d4e0, inset -4px -4px 8px #ffffff";
                  }}
                  onMouseUp={(e) => {
                    if (!loading) e.currentTarget.style.boxShadow = "8px 8px 16px #c5d4e0, -8px -8px 16px #ffffff";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.boxShadow = "8px 8px 16px #c5d4e0, -8px -8px 16px #ffffff";
                  }}
                >
                  {loading ? "Loading..." : "✨ Tambah Project"}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {displayedProjects.map((p, i) => (
                  <div
                    key={i}
                    className="group relative p-6 transition-all duration-500 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, #e8f1f8 0%, #dae7f3 100%)",
                      boxShadow: "15px 15px 40px #c5d4e0, -15px -15px 40px #ffffff",
                      transition: "all 0.5s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "20px 20px 50px #b8c9d9, -20px -20px 50px #ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "15px 15px 40px #c5d4e0, -15px -15px 40px #ffffff";
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-700 mb-2 pr-20">
                          {p.name}
                        </h3>
                      </div>
                      
                      <div className="flex gap-2 absolute top-5 right-5">
                        <button
                          onClick={() => toggleDaily(p.name, p.daily)}
                          className="p-2 rounded-xl transition-all duration-300"
                          style={{
                            background: "#e8f1f8",
                            boxShadow: p.daily === "CHECKED" 
                              ? "inset 4px 4px 8px #c5d4e0, inset -4px -4px 8px #ffffff"
                              : "4px 4px 8px #c5d4e0, -4px -4px 8px #ffffff",
                            color: p.daily === "CHECKED" ? "#06b6d4" : "#94a3b8"
                          }}
                          title="Toggle Daily Check"
                        >
                          {p.daily === "CHECKED" ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        <button
                          onClick={() => deleteProject(p.name)}
                          className="p-2 rounded-xl transition-all duration-300"
                          style={{
                            background: "#e8f1f8",
                            boxShadow: "4px 4px 8px #c5d4e0, -4px -4px 8px #ffffff",
                            color: "#ef4444"
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.boxShadow = "inset 3px 3px 6px #c5d4e0, inset -3px -3px 6px #ffffff";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.boxShadow = "4px 4px 8px #c5d4e0, -4px -4px 8px #ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "4px 4px 8px #c5d4e0, -4px -4px 8px #ffffff";
                          }}
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
                              className="text-white text-xs px-3 py-1.5 rounded-full font-semibold"
                              style={{
                                background: `linear-gradient(135deg, ${tag.color.replace('bg-', '#')}, ${tag.color.replace('bg-', '#')})`,
                                boxShadow: "4px 4px 10px rgba(0,0,0,0.2), -2px -2px 8px rgba(255,255,255,0.5)"
                              }}
                            >
                              {tag.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {p.notes && (
                      <div className="mb-4 p-3 rounded-2xl" style={{
                        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                        boxShadow: "inset 4px 4px 8px #e5d4a0, inset -4px -4px 8px #fffef0"
                      }}>
                        <p className="flex items-start gap-2 text-sm text-gray-700">
                          <StickyNote size={16} className="mt-0.5 text-amber-600 flex-shrink-0" />
                          <span className="italic leading-relaxed">{p.notes}</span>
                        </p>
                      </div>
                    )}

                    <div className="h-px my-4" style={{
                      background: "linear-gradient(90deg, transparent, #c5d4e0, transparent)"
                    }}></div>

                    <div className="space-y-2">
                      {p.twitter && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Twitter size={14} className="text-blue-500"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.twitter}</span>
                        </div>
                      )}
                      
                      {p.discord && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <MessageCircle size={14} className="text-indigo-500"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.discord}</span>
                        </div>
                      )}
                      
                      {p.telegram && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Send size={14} className="text-sky-500"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.telegram}</span>
                        </div>
                      )}
                      
                      {p.farcaster && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Zap size={14} className="text-purple-500"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.farcaster}</span>
                        </div>
                      )}
                      
                      {p.wallet && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Wallet size={14} className="text-yellow-600"/>
                          </div>
                          <span className="text-xs text-gray-600 font-mono break-all">{hideData ? "••••••••••••••" : p.wallet}</span>
                        </div>
                      )}
                      
                      {p.email && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Mail size={14} className="text-pink-500"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.email}</span>
                        </div>
                      )}
                      
                      {p.github && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Github size={14} className="text-gray-600"/>
                          </div>
                          <span className="text-sm text-gray-600 font-mono truncate">{hideData ? "••••••" : p.github}</span>
                        </div>
                      )}
                      
                      {p.website && (
                        <div className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300" style={{
                          background: "#e8f1f8",
                          boxShadow: "inset 3px 3px 6px #d4e3ee, inset -3px -3px 6px #fcffff"
                        }}>
                          <div className="p-1.5 rounded-lg" style={{
                            background: "#e8f1f8",
                            boxShadow: "3px 3px 6px #c5d4e0, -3px -3px 6px #ffffff"
                          }}>
                            <Globe size={14} className="text-blue-500"/>
                          </div>
                          <a 
                            href={p.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-600 hover:text-blue-700 underline truncate transition-colors font-medium"
                          >
                            {p.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {p.lastupdate && (
                      <div className="mt-4 pt-3" style={{
                        borderTop: "1px solid #c5d4e0"
                      }}>
                        <p className="text-xs text-gray-500 text-center font-medium">
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
