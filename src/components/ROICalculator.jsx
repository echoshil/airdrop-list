import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROICalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
    projectName: "",
    gasSpent: "",
    timeInvested: "",
    expectedValue: "",
    probability: "50",
  });
  const [result, setResult] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Historical airdrop data (sample)
  const historicalAirdrops = [
    { name: "Uniswap", avgReturn: 12000, probability: 100 },
    { name: "dYdX", avgReturn: 8000, probability: 85 },
    { name: "Optimism", avgReturn: 5000, probability: 90 },
    { name: "Arbitrum", avgReturn: 3500, probability: 95 },
    { name: "Aptos", avgReturn: 2000, probability: 70 },
    { name: "zkSync", avgReturn: 1500, probability: 60 },
    { name: "Blur", avgReturn: 4000, probability: 75 },
    { name: "Celestia", avgReturn: 3000, probability: 65 },
  ];

  // Load saved calculations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("roi_calculations");
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);

  const calculateROI = () => {
    const gas = parseFloat(formData.gasSpent) || 0;
    const time = parseFloat(formData.timeInvested) || 0;
    const expected = parseFloat(formData.expectedValue) || 0;
    const prob = parseFloat(formData.probability) || 50;

    // Time value calculation (assume $20/hour)
    const timeValue = time * 20;
    const totalInvestment = gas + timeValue;

    // Expected value with probability
    const adjustedExpected = (expected * prob) / 100;

    // ROI calculation
    const profit = adjustedExpected - totalInvestment;
    const roiPercentage =
      totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    // Break-even calculation
    const breakEvenValue = totalInvestment;

    // Risk assessment
    let riskLevel = "Low";
    let riskColor = "text-green-400";
    if (roiPercentage < 0) {
      riskLevel = "High";
      riskColor = "text-red-400";
    } else if (roiPercentage < 100) {
      riskLevel = "Medium";
      riskColor = "text-yellow-400";
    }

    // Projection scenarios
    const scenarios = [
      {
        name: "Pessimistic",
        value: adjustedExpected * 0.3,
        profit: adjustedExpected * 0.3 - totalInvestment,
      },
      {
        name: "Realistic",
        value: adjustedExpected,
        profit: profit,
      },
      {
        name: "Optimistic",
        value: adjustedExpected * 2,
        profit: adjustedExpected * 2 - totalInvestment,
      },
    ];

    const resultData = {
      totalInvestment: totalInvestment.toFixed(2),
      expectedReturn: adjustedExpected.toFixed(2),
      profit: profit.toFixed(2),
      roiPercentage: roiPercentage.toFixed(2),
      breakEvenValue: breakEvenValue.toFixed(2),
      riskLevel,
      riskColor,
      scenarios,
      projectName: formData.projectName || "Unnamed Project",
      timestamp: new Date().toISOString(),
    };

    setResult(resultData);
  };

  const saveCalculation = () => {
    if (!result) return;
    const newCalculations = [result, ...savedCalculations].slice(0, 10);
    setSavedCalculations(newCalculations);
    localStorage.setItem("roi_calculations", JSON.stringify(newCalculations));
    alert("✅ Calculation saved!");
  };

  const deleteCalculation = (index) => {
    const updated = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(updated);
    localStorage.setItem("roi_calculations", JSON.stringify(updated));
  };

  const clearForm = () => {
    setFormData({
      projectName: "",
      gasSpent: "",
      timeInvested: "",
      expectedValue: "",
      probability: "50",
    });
    setResult(null);
  };

  // Chart data for scenarios
  const scenarioChartData = result
    ? result.scenarios.map((s) => ({
        name: s.name,
        Investment: parseFloat(result.totalInvestment),
        Return: s.value,
        Profit: s.profit > 0 ? s.profit : 0,
      }))
    : [];

  // Pie chart for investment breakdown
  const investmentBreakdown = result
    ? [
        {
          name: "Gas Costs",
          value: parseFloat(formData.gasSpent) || 0,
          color: "#f59e0b",
        },
        {
          name: "Time Value",
          value: parseFloat(formData.timeInvested) * 20 || 0,
          color: "#06b6d4",
        },
      ]
    : [];

  return (
    <div className="relative z-10 w-full mb-8 fade-in">
      {/* Header */}
      <div className="bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
            <Calculator size={28} />
            📈 ROI Calculator
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-gray-300">
              <strong className="text-blue-400">How it works:</strong> Enter
              your gas costs, time invested, and expected airdrop value. The
              calculator will show your potential ROI with different scenarios.
              Time is valued at $20/hour.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">Input Data</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., zkSync, LayerZero"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  💰 Gas Spent (USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.gasSpent}
                  onChange={(e) =>
                    setFormData({ ...formData, gasSpent: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ⏱️ Time Invested (Hours)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.timeInvested}
                  onChange={(e) =>
                    setFormData({ ...formData, timeInvested: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  🎯 Expected Airdrop Value (USD)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 3000"
                  value={formData.expectedValue}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedValue: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  📊 Success Probability: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={calculateROI}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Calculator size={18} />
                  Calculate ROI
                </button>
                <button
                  onClick={clearForm}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Historical Data Reference */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">
                📊 Historical Airdrop Data
              </h3>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-800">
                    <tr className="text-cyan-400 border-b border-gray-700">
                      <th className="p-2 text-left">Project</th>
                      <th className="p-2 text-right">Avg Return</th>
                      <th className="p-2 text-right">Success %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalAirdrops.map((airdrop, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-700 hover:bg-gray-700/30 cursor-pointer"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            projectName: airdrop.name,
                            expectedValue: airdrop.avgReturn.toString(),
                            probability: airdrop.probability.toString(),
                          })
                        }
                      >
                        <td className="p-2 text-white font-medium">
                          {airdrop.name}
                        </td>
                        <td className="p-2 text-right text-green-400 font-semibold">
                          ${airdrop.avgReturn.toLocaleString()}
                        </td>
                        <td className="p-2 text-right text-yellow-400">
                          {airdrop.probability}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-3 italic">
                  💡 Click on any row to use as reference
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-cyan-400">Results</h3>
                <button
                  onClick={saveCalculation}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                >
                  <Save size={16} />
                  Save Calculation
                </button>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Investment</p>
                      <p className="text-2xl font-bold text-orange-400">
                        ${result.totalInvestment}
                      </p>
                    </div>
                    <DollarSign className="text-orange-400" size={32} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Expected Return</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        ${result.expectedReturn}
                      </p>
                    </div>
                    <TrendingUp className="text-cyan-400" size={32} />
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br ${
                    parseFloat(result.profit) >= 0
                      ? "from-green-600/20 to-green-800/20 border-green-500/30"
                      : "from-red-600/20 to-red-800/20 border-red-500/30"
                  } border rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Profit/Loss</p>
                      <p
                        className={`text-2xl font-bold ${
                          parseFloat(result.profit) >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        ${result.profit}
                      </p>
                    </div>
                    <Zap
                      className={`${
                        parseFloat(result.profit) >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                      size={32}
                    />
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br ${
                    parseFloat(result.roiPercentage) >= 0
                      ? "from-purple-600/20 to-purple-800/20 border-purple-500/30"
                      : "from-red-600/20 to-red-800/20 border-red-500/30"
                  } border rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">ROI</p>
                      <p
                        className={`text-2xl font-bold ${
                          parseFloat(result.roiPercentage) >= 0
                            ? "text-purple-400"
                            : "text-red-400"
                        }`}
                      >
                        {result.roiPercentage}%
                      </p>
                    </div>
                    <TrendingUp
                      className={`${
                        parseFloat(result.roiPercentage) >= 0
                          ? "text-purple-400"
                          : "text-red-400"
                      }`}
                      size={32}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div
                className={`p-4 rounded-xl border ${
                  result.riskLevel === "Low"
                    ? "bg-green-600/10 border-green-500/30"
                    : result.riskLevel === "Medium"
                    ? "bg-yellow-600/10 border-yellow-500/30"
                    : "bg-red-600/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info className={result.riskColor} size={24} />
                  <div>
                    <p className="font-semibold text-white">
                      Risk Level: <span className={result.riskColor}>{result.riskLevel}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Break-even value: ${result.breakEvenValue} | Time valued
                      at $20/hour
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scenario Comparison */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">
                    Profit Projection Scenarios
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={scenarioChartData}>
                      <XAxis
                        dataKey="name"
                        stroke="#9ca3af"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          background: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Investment" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Return" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Profit" fill="#22c55e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Investment Breakdown */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">
                    Investment Breakdown
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={investmentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {investmentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Saved Calculations */}
          {savedCalculations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">
                💾 Saved Calculations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCalculations.map((calc, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {calc.projectName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(calc.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCalculation(i)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investment:</span>
                        <span className="text-orange-400 font-semibold">
                          ${calc.totalInvestment}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span
                          className={`font-semibold ${
                            parseFloat(calc.roiPercentage) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {calc.roiPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit:</span>
                        <span
                          className={`font-semibold ${
                            parseFloat(calc.profit) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          ${calc.profit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ROICalculator;

