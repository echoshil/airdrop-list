import React, { useState, useEffect } from \"react\";
import { Fuel, TrendingUp, TrendingDown, AlertCircle } from \"lucide-react\";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from \"recharts\";

const GasTracker = () => {
  const [gasData, setGasData] = useState({
    ethereum: { slow: 0, average: 0, fast: 0 },
    bsc: { slow: 0, average: 0, fast: 0 },
    polygon: { slow: 0, average: 0, fast: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedChain, setSelectedChain] = useState(\"ethereum\");

  // Fetch gas prices
  const fetchGasPrices = async () => {
    try {
      setLoading(true);

      // Ethereum Gas (using ethers provider)
      const ethProvider = new (await import(\"ethers\")).JsonRpcProvider(
        \"https://eth.llamarpc.com\"
      );
      const ethGasPrice = await ethProvider.getFeeData();
      const ethGasGwei = parseFloat(
        (await import(\"ethers\")).formatUnits(ethGasPrice.gasPrice, \"gwei\")
      );

      // BSC Gas
      const bscProvider = new (await import(\"ethers\")).JsonRpcProvider(
        \"https://bsc-dataseed.binance.org\"
      );
      const bscGasPrice = await bscProvider.getFeeData();
      const bscGasGwei = parseFloat(
        (await import(\"ethers\")).formatUnits(bscGasPrice.gasPrice, \"gwei\")
      );

      // Polygon Gas
      const polygonProvider = new (await import(\"ethers\")).JsonRpcProvider(
        \"https://polygon-rpc.com\"
      );
      const polygonGasPrice = await polygonProvider.getFeeData();
      const polygonGasGwei = parseFloat(
        (await import(\"ethers\")).formatUnits(polygonGasPrice.gasPrice, \"gwei\")
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

      // Add to historical data
      const timestamp = new Date().toLocaleTimeString(\"en-US\", {
        hour: \"2-digit\",
        minute: \"2-digit\",
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
        // Keep only last 20 data points
        return newData.slice(-20);
      });

      setLoading(false);
    } catch (err) {
      console.error(\"Error fetching gas prices:\", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasPrices();
    const interval = setInterval(fetchGasPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get recommendation based on gas price
  const getRecommendation = (chain) => {
    const avgGas = gasData[chain].average;
    let threshold = { low: 20, medium: 50 };

    if (chain === \"bsc\") threshold = { low: 3, medium: 5 };
    if (chain === \"polygon\") threshold = { low: 30, medium: 80 };

    if (avgGas <= threshold.low) {
      return {
        color: \"text-green-400\",
        bg: \"bg-green-600/20\",
        icon: TrendingDown,
        text: \"Excellent time to transact!\",
      };
    } else if (avgGas <= threshold.medium) {
      return {
        color: \"text-yellow-400\",
        bg: \"bg-yellow-600/20\",
        icon: AlertCircle,
        text: \"Moderate gas prices\",
      };
    } else {
      return {
        color: \"text-red-400\",
        bg: \"bg-red-600/20\",
        icon: TrendingUp,
        text: \"High gas - wait if possible\",
      };
    }
  };

  const chains = [
    { id: \"ethereum\", name: \"Ethereum\", color: \"#627EEA\" },
    { id: \"bsc\", name: \"BSC\", color: \"#F3BA2F\" },
    { id: \"polygon\", name: \"Polygon\", color: \"#8247E5\" },
  ];

  return (
    <div className=\"relative z-10 w-full mb-8 fade-in\">
      {/* Header */}
      <div className=\"bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0\">
        <div className=\"p-4 flex justify-between items-center\">
          <h2 className=\"text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2\">
            <Fuel size={28} />
            ⛽ Real-time Gas Tracker
          </h2>
          <div className=\"text-sm text-gray-400\">
            {loading ? \"🔄 Updating...\" : \"✅ Live\"}
          </div>
        </div>
      </div>

      {/* Gas Cards */}
      <div className=\"bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6\">
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-6\">
          {chains.map((chain) => {
            const rec = getRecommendation(chain.id);
            const gas = gasData[chain.id];
            const Icon = rec.icon;

            return (
              <div
                key={chain.id}
                className={`${rec.bg} border border-gray-700 rounded-xl p-4 hover:scale-105 transition-transform cursor-pointer ${
                  selectedChain === chain.id ? \"ring-2 ring-cyan-400\" : \"\"
                }`}
                onClick={() => setSelectedChain(chain.id)}
              >
                <div className=\"flex items-center justify-between mb-3\">
                  <h3 className=\"text-lg font-semibold text-white\">
                    {chain.name}
                  </h3>
                  <Icon className={rec.color} size={24} />
                </div>

                <div className=\"space-y-2\">
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-gray-400\">Slow:</span>
                    <span className=\"text-green-400 font-semibold\">
                      {gas.slow} Gwei
                    </span>
                  </div>
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-gray-400\">Average:</span>
                    <span className=\"text-yellow-400 font-semibold\">
                      {gas.average} Gwei
                    </span>
                  </div>
                  <div className=\"flex justify-between text-sm\">
                    <span className=\"text-gray-400\">Fast:</span>
                    <span className=\"text-red-400 font-semibold\">
                      {gas.fast} Gwei
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-3 pt-3 border-t border-gray-700 text-xs ${rec.color} flex items-center gap-2`}
                >
                  <Icon size={14} />
                  {rec.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Historical Chart */}
        {historicalData.length > 0 && (
          <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
            <h3 className=\"text-lg font-semibold text-cyan-400 mb-4\">
              Gas Price History (Last 10 minutes)
            </h3>
            <ResponsiveContainer width=\"100%\" height={250}>
              <LineChart data={historicalData}>
                <XAxis
                  dataKey=\"time\"
                  stroke=\"#9ca3af\"
                  style={{ fontSize: \"12px\" }}
                />
                <YAxis
                  stroke=\"#9ca3af\"
                  style={{ fontSize: \"12px\" }}
                  label={{
                    value: \"Gwei\",
                    angle: -90,
                    position: \"insideLeft\",
                    style: { fill: \"#9ca3af\" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: \"#1f2937\",
                    border: \"1px solid #374151\",
                    borderRadius: \"8px\",
                    color: \"#fff\",
                  }}
                />
                <Legend />
                <Line
                  type=\"monotone\"
                  dataKey=\"ethereum\"
                  stroke=\"#627EEA\"
                  strokeWidth={2}
                  dot={{ fill: \"#627EEA\", r: 3 }}
                  name=\"Ethereum\"
                />
                <Line
                  type=\"monotone\"
                  dataKey=\"bsc\"
                  stroke=\"#F3BA2F\"
                  strokeWidth={2}
                  dot={{ fill: \"#F3BA2F\", r: 3 }}
                  name=\"BSC\"
                />
                <Line
                  type=\"monotone\"
                  dataKey=\"polygon\"
                  stroke=\"#8247E5\"
                  strokeWidth={2}
                  dot={{ fill: \"#8247E5\", r: 3 }}
                  name=\"Polygon\"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Tips */}
        <div className=\"mt-6 bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-pink-600/10 border border-cyan-500/30 rounded-xl p-4\">
          <h3 className=\"text-lg font-semibold text-cyan-400 mb-3\">
            ⚡ Gas Saving Tips
          </h3>
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3 text-sm\">
            <div className=\"flex items-start gap-2\">
              <span className=\"text-green-400\">✓</span>
              <span className=\"text-gray-300\">
                Transact during <strong className=\"text-green-400\">low activity hours</strong> (weekends, late night UTC)
              </span>
            </div>
            <div className=\"flex items-start gap-2\">
              <span className=\"text-yellow-400\">⚡</span>
              <span className=\"text-gray-300\">
                Use <strong className=\"text-yellow-400\">Layer 2 solutions</strong> for lower fees
              </span>
            </div>
            <div className=\"flex items-start gap-2\">
              <span className=\"text-blue-400\">🎯</span>
              <span className=\"text-gray-300\">
                Set <strong className=\"text-blue-400\">custom gas limits</strong> to save costs
              </span>
            </div>
            <div className=\"flex items-start gap-2\">
              <span className=\"text-purple-400\">📊</span>
              <span className=\"text-gray-300\">
                Monitor trends and <strong className=\"text-purple-400\">wait for dips</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasTracker;
