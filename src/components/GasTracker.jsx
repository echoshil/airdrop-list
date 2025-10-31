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

  const fetchGasPrices = async () => {
    try {
      setLoading(true);
      const { JsonRpcProvider, formatUnits } = await import("ethers");

      // Fetch Ethereum gas with multiple fallback RPCs
      let ethGasGwei = 0;
      const ethRPCs = [
        "https://eth.llamarpc.com",
        "https://rpc.ankr.com/eth",
        "https://ethereum.publicnode.com"
      ];
      
      for (const rpc of ethRPCs) {
        try {
          const ethProvider = new JsonRpcProvider(rpc);
          const ethGasPrice = await ethProvider.getFeeData();
          if (ethGasPrice.gasPrice) {
            ethGasGwei = parseFloat(formatUnits(ethGasPrice.gasPrice, "gwei"));
            console.log(`✅ Ethereum gas fetched from ${rpc}: ${ethGasGwei} Gwei`);
            break;
          }
        } catch (err) {
          console.warn(`⚠️ Failed to fetch Ethereum from ${rpc}:`, err.message);
          continue;
        }
      }

      // Fetch BSC gas with multiple fallback RPCs
      let bscGasGwei = 0;
      const bscRPCs = [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed.binance.org",
        "https://rpc.ankr.com/bsc"
      ];
      
      for (const rpc of bscRPCs) {
        try {
          const bscProvider = new JsonRpcProvider(rpc);
          const bscGasPrice = await bscProvider.getFeeData();
          if (bscGasPrice.gasPrice) {
            bscGasGwei = parseFloat(formatUnits(bscGasPrice.gasPrice, "gwei"));
            console.log(`✅ BSC gas fetched from ${rpc}: ${bscGasGwei} Gwei`);
            break;
          }
        } catch (err) {
          console.warn(`⚠️ Failed to fetch BSC from ${rpc}:`, err.message);
          continue;
        }
      }

      // Fetch Polygon gas
      let polygonGasGwei = 0;
      const polygonRPCs = [
        "https://polygon-rpc.com",
        "https://rpc.ankr.com/polygon",
        "https://polygon.llamarpc.com"
      ];
      
      for (const rpc of polygonRPCs) {
        try {
          const polygonProvider = new JsonRpcProvider(rpc);
          const polygonGasPrice = await polygonProvider.getFeeData();
          if (polygonGasPrice.gasPrice) {
            polygonGasGwei = parseFloat(formatUnits(polygonGasPrice.gasPrice, "gwei"));
            console.log(`✅ Polygon gas fetched from ${rpc}: ${polygonGasGwei} Gwei`);
            break;
          }
        } catch (err) {
          console.warn(`⚠️ Failed to fetch Polygon from ${rpc}:`, err.message);
          continue;
        }
      }

      setGasData({
        ethereum: {
          slow: Math.max(1, Math.floor(ethGasGwei * 0.9)),
          average: Math.max(1, Math.floor(ethGasGwei)),
          fast: Math.max(1, Math.floor(ethGasGwei * 1.2)),
        },
        bsc: {
          slow: Math.max(1, Math.floor(bscGasGwei * 0.9)),
          average: Math.max(1, Math.floor(bscGasGwei)),
          fast: Math.max(1, Math.floor(bscGasGwei * 1.2)),
        },
        polygon: {
          slow: Math.max(1, Math.floor(polygonGasGwei * 0.9)),
          average: Math.max(1, Math.floor(polygonGasGwei)),
          fast: Math.max(1, Math.floor(polygonGasGwei * 1.2)),
        },
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
            ethereum: Math.max(1, Math.floor(ethGasGwei)),
            bsc: Math.max(1, Math.floor(bscGasGwei)),
            polygon: Math.max(1, Math.floor(polygonGasGwei)),
          },
        ];
        return newData.slice(-20);
      });

      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching gas prices:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 30000);
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
        text: "Excellent time to transact!",
      };
    } else if (avgGas <= threshold.medium) {
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-600/20",
        icon: AlertCircle,
        text: "Moderate gas prices",
      };
    } else {
      return {
        color: "text-red-400",
        bg: "bg-red-600/20",
        icon: TrendingUp,
        text: "High gas - wait if possible",
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
              {loading ? "🔄 Updating..." : "✅ Live"}
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
                slow: { label: "🐢 Slow", desc: "Lower cost" },
                average: { label: "⚡ Average", desc: "Balanced" },
                fast: { label: "🚀 Fast", desc: "Quick confirm" },
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
                    Current average: {gasData[selectedChain].average} Gwei
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Historical Chart */}
          {historicalData.length > 1 && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                📊 Gas Price Trend (Last 30 mins)
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
            ℹ️ Prices update automatically every 30 seconds
          </div>
        </div>
      )}
    </div>
  );
};

export default GasTracker;

