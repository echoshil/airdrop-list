import React, { useState, useEffect } from "react";
import { Fuel, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const GasTracker = () => {
  const [gasData, setGasData] = useState({
    ethereum: { slow: 0, average: 0, fast: 0 },
    bsc: { slow: 0, average: 0, fast: 0 },
    polygon: { slow: 0, average: 0, fast: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchGasPrices = async () => {
    try {
      setLoading(true);
      
      // Get API keys from environment
      const etherscanKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
      const bscscanKey = import.meta.env.VITE_BSCSCAN_API_KEY;
      const polygonscanKey = import.meta.env.VITE_POLYGONSCAN_API_KEY;

      // Fetch Ethereum gas prices (using Etherscan V2 API)
      let ethGasData = { slow: 0, average: 0, fast: 0 };
      try {
        const ethResponse = await fetch(
          `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${etherscanKey}`
        );
        const ethResult = await ethResponse.json();
        
        if (ethResult.status === "1" && ethResult.result) {
          // Etherscan V2 returns decimal Gwei values, convert to proper display format
          const baseFee = parseFloat(ethResult.result.suggestBaseFee);
          ethGasData = {
            slow: parseFloat((baseFee * 0.95).toFixed(2)),
            average: parseFloat((baseFee * 1.0).toFixed(2)),
            fast: parseFloat((baseFee * 1.15).toFixed(2)),
          };
          console.log("✅ Ethereum gas fetched from Etherscan API V2:", ethGasData);
        } else {
          throw new Error("Invalid Etherscan response");
        }
      } catch (err) {
        console.warn("⚠️ Etherscan API failed, using RPC fallback:", err.message);
        ethGasData = await fetchGasFromRPC("ethereum");
      }

      // Fetch BSC gas prices with enhanced accuracy
      let bscGasData = { slow: 0, average: 0, fast: 0 };
      try {
        // Try BNB48 Club Gas Tracker API first (most accurate for BSC)
        const bnb48Response = await fetch('https://www.bnb48.club/api/gasprice');
        const bnb48Result = await bnb48Response.json();
        
        if (bnb48Result && bnb48Result.result) {
          bscGasData = {
            slow: parseFloat(bnb48Result.result.SafeGasPrice),
            average: parseFloat(bnb48Result.result.ProposeGasPrice),
            fast: parseFloat(bnb48Result.result.FastGasPrice),
          };
          console.log("✅ BSC gas fetched from BNB48 API:", bscGasData);
        } else {
          throw new Error("Invalid BNB48 response");
        }
      } catch (err) {
        console.warn("⚠️ BNB48 API failed, using enhanced RPC method:", err.message);
        bscGasData = await fetchBSCGasEnhanced();
      }

      // Fetch Polygon gas prices (using Polygon Gas Station API - free and accurate)
      let polygonGasData = { slow: 0, average: 0, fast: 0 };
      try {
        const polygonResponse = await fetch("https://gasstation.polygon.technology/v2");
        const polygonResult = await polygonResponse.json();
        
        if (polygonResult && polygonResult.safeLow) {
          polygonGasData = {
            slow: Math.round(parseFloat(polygonResult.safeLow.maxFee)),
            average: Math.round(parseFloat(polygonResult.standard.maxFee)),
            fast: Math.round(parseFloat(polygonResult.fast.maxFee)),
          };
          console.log("✅ Polygon gas fetched from Gas Station API:", polygonGasData);
        } else {
          throw new Error("Invalid Polygon Gas Station response");
        }
      } catch (err) {
        console.warn("⚠️ Polygon Gas Station API failed, using RPC fallback:", err.message);
        polygonGasData = await fetchGasFromRPC("polygon");
      }

      setGasData({
        ethereum: ethGasData,
        bsc: bscGasData,
        polygon: polygonGasData,
      });

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setHistoricalData((prev) => {
        const newData = [
          ...prev,
          {
            time: timestamp,
            ethereum: ethGasData.average,
            bsc: bscGasData.average,
            polygon: polygonGasData.average,
          },
        ];
        return newData.slice(-20);
      });

      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching gas prices:", err);
      setLoading(false);
    }
  };

  // Enhanced BSC gas fetching with multiple sources
  const fetchBSCGasEnhanced = async () => {
    try {
      const { JsonRpcProvider, formatUnits } = await import("ethers");
      
      const rpcUrls = [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://bsc-dataseed4.binance.org",
        "https://rpc.ankr.com/bsc",
      ];
      
      const gasPrices = [];
      
      // Query multiple RPCs for more accurate data
      for (const rpc of rpcUrls.slice(0, 4)) {
        try {
          const provider = new JsonRpcProvider(rpc);
          const feeData = await provider.getFeeData();
          
          if (feeData.gasPrice) {
            const gasGwei = parseFloat(formatUnits(feeData.gasPrice, "gwei"));
            gasPrices.push(gasGwei);
            console.log(`📊 BSC RPC ${rpc}: ${gasGwei} Gwei`);
          }
        } catch (err) {
          console.warn(`⚠️ BSC RPC ${rpc} failed:`, err.message);
          continue;
        }
      }
      
      if (gasPrices.length > 0) {
        // Calculate average from multiple sources
        const avgGas = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length;
        
        const result = {
          slow: parseFloat((avgGas * 0.8).toFixed(2)),
          average: parseFloat(avgGas.toFixed(2)),
          fast: parseFloat((avgGas * 1.25).toFixed(2)),
        };
        
        console.log(`✅ BSC gas calculated from ${gasPrices.length} sources:`, result);
        return result;
      }
      
      // If all fail, return reasonable defaults for BSC
      return { slow: 3, average: 5, fast: 7 };
    } catch (err) {
      console.error("❌ Error in BSC enhanced fetch:", err);
      return { slow: 3, average: 5, fast: 7 };
    }
  };

  // RPC fallback function
  const fetchGasFromRPC = async (chain) => {
    try {
      const { JsonRpcProvider, formatUnits } = await import("ethers");
      
      const rpcUrls = {
        ethereum: [
          "https://eth.llamarpc.com",
          "https://rpc.ankr.com/eth",
          "https://ethereum.publicnode.com"
        ],
        bsc: [
          "https://bsc-dataseed1.binance.org",
          "https://bsc-dataseed.binance.org",
          "https://rpc.ankr.com/bsc"
        ],
        polygon: [
          "https://polygon-rpc.com",
          "https://rpc.ankr.com/polygon",
          "https://polygon.llamarpc.com"
        ]
      };

      for (const rpc of rpcUrls[chain]) {
        try {
          const provider = new JsonRpcProvider(rpc);
          const feeData = await provider.getFeeData();
          
          if (feeData.gasPrice) {
            const gasGwei = parseFloat(formatUnits(feeData.gasPrice, "gwei"));
            const gasData = {
              slow: Math.max(1, Math.round(gasGwei * 0.85)),
              average: Math.max(1, Math.round(gasGwei)),
              fast: Math.max(1, Math.round(gasGwei * 1.15)),
            };
            console.log(`✅ ${chain} gas fetched from RPC ${rpc}:`, gasData);
            return gasData;
          }
        } catch (err) {
          console.warn(`⚠️ RPC ${rpc} failed:`, err.message);
          continue;
        }
      }
      
      // If all RPCs fail, return default values
      return { slow: 1, average: 1, fast: 1 };
    } catch (err) {
      console.error(`❌ Error fetching ${chain} from RPC:`, err);
      return { slow: 1, average: 1, fast: 1 };
    }
  };

  useEffect(() => {
    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 15000); // Update every 15 seconds for real-time
    return () => clearInterval(interval);
  }, []);

  const getRecommendation = (chain) => {
    const avgGas = gasData[chain].average;
    let threshold = { low: 20, medium: 50 };

    if (chain === "bsc") threshold = { low: 3, medium: 5 };
    if (chain === "polygon") threshold = { low: 30, medium: 80 };

    if (avgGas <= threshold.low) {
      return {
        color: "text-green-400",
        bg: "bg-green-600/20",
        icon: TrendingDown,
        text: "Waktu terbaik untuk transaksi!",
      };
    } else if (avgGas <= threshold.medium) {
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-600/20",
        icon: AlertCircle,
        text: "Biaya gas sedang",
      };
    } else {
      return {
        color: "text-red-400",
        bg: "bg-red-600/20",
        icon: TrendingUp,
        text: "Gas tinggi - tunggu jika memungkinkan",
      };
    }
  };

  const chains = [
    { id: "ethereum", name: "Ethereum", color: "#627EEA" },
    { id: "bsc", name: "BSC", color: "#F3BA2F" },
    { id: "polygon", name: "Polygon", color: "#8247E5" },
  ];

  return (
    <div className="relative z-10 w-full mb-8 fade-in">
      <div className="bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0">
        <div 
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800/30 transition"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Fuel size={28} /> ⛽ Real-time Gas Tracker
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">
              {loading ? "🔄 Memperbarui..." : "✅ Live Data"}
            </div>
            <button 
              className="text-gray-400 hover:text-white transition"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6 animate-fadeIn">
          {/* Chain Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {chains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedChain === chain.id
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {chain.name}
              </button>
            ))}
          </div>

          {/* Gas Price Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {["slow", "average", "fast"].map((speed) => {
              const speedLabels = {
                slow: { label: "🐢 Lambat", desc: "Biaya rendah" },
                average: { label: "⚡ Rata-rata", desc: "Seimbang" },
                fast: { label: "🚀 Cepat", desc: "Konfirmasi cepat" },
              };

              return (
                <div
                  key={speed}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition"
                >
                  <div className="text-sm text-gray-400 mb-1">
                    {speedLabels[speed].label}
                  </div>
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {gasData[selectedChain][speed]} Gwei
                  </div>
                  <div className="text-xs text-gray-500">
                    {speedLabels[speed].desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation Card */}
          {(() => {
            const rec = getRecommendation(selectedChain);
            const Icon = rec.icon;
            return (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${rec.bg} border border-gray-700 mb-6`}
              >
                <Icon className={`${rec.color}`} size={24} />
                <div>
                  <div className={`font-semibold ${rec.color}`}>{rec.text}</div>
                  <div className="text-sm text-gray-400">
                    Rata-rata saat ini: {gasData[selectedChain].average} Gwei
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Historical Chart */}
          {historicalData.length > 1 && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                📊 Tren Harga Gas (Real-time)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={historicalData}>
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ethereum"
                    stroke="#627EEA"
                    strokeWidth={2}
                    dot={false}
                    name="Ethereum"
                  />
                  <Line
                    type="monotone"
                    dataKey="bsc"
                    stroke="#F3BA2F"
                    strokeWidth={2}
                    dot={false}
                    name="BSC"
                  />
                  <Line
                    type="monotone"
                    dataKey="polygon"
                    stroke="#8247E5"
                    strokeWidth={2}
                    dot={false}
                    name="Polygon"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Info Footer */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            ℹ️ Data diperbarui otomatis setiap 15 detik dari API resmi | 
            {lastUpdate && ` Terakhir update: ${lastUpdate.toLocaleTimeString('id-ID')}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GasTracker;
