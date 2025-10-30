import React, { useState, useEffect } from "react";
import { Fuel, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
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

  const fetchGasPrices = async () => {
    try {
      setLoading(true);

      const ethProvider = new (await import("ethers")).JsonRpcProvider(
        "https://eth.llamarpc.com"
      );
      const ethGasPrice = await ethProvider.getFeeData();
      const ethGasGwei = parseFloat(
        (await import("ethers")).formatUnits(ethGasPrice.gasPrice, "gwei")
      );

      const bscProvider = new (await import("ethers")).JsonRpcProvider(
        "https://bsc-dataseed.binance.org"
      );
      const bscGasPrice = await bscProvider.getFeeData();
      const bscGasGwei = parseFloat(
        (await import("ethers")).formatUnits(bscGasPrice.gasPrice, "gwei")
      );

      const polygonProvider = new (await import("ethers")).JsonRpcProvider(
        "https://polygon-rpc.com"
      );
      const polygonGasPrice = await polygonProvider.getFeeData();
      const polygonGasGwei = parseFloat(
        (await import("ethers")).formatUnits(polygonGasPrice.gasPrice, "gwei")
      );

      setGasData({
        ethereum: {
          slow: Math.floor(ethGasGwei * 0.9),
          average: Math.floor(ethGasGwei),
          fast: Math.floor(ethGasGwei * 1.2),
        },
        bsc: {
          slow: Math.floor(bscGasGwei * 0.9),
          average: Math.floor(bscGasGwei),
          fast: Math.floor(bscGasGwei * 1.2),
        },
        polygon: {
          slow: Math.floor(polygonGasGwei * 0.9),
          average: Math.floor(polygonGasGwei),
          fast: Math.floor(polygonGasGwei * 1.2),
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
            ethereum: Math.floor(ethGasGwei),
            bsc: Math.floor(bscGasGwei),
            polygon: Math.floor(polygonGasGwei),
          },
        ];
        return newData.slice(-20);
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching gas prices:", err);
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
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Fuel size={28} /> ⛽ Real-time Gas Tracker
          </h2>
          <div className="text-sm text-gray-400">
            {loading ? "🔄 Updating..." : "✅ Live"}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6">
        {/* ... UI tetap sama seperti kode kamu ... */}
      </div>
    </div>
  );
};

export default GasTracker;
