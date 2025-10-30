"import React, { useState, useEffect, useMemo } from \"react\";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from \"recharts\";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Wallet,
  Network,
  Activity,
  ChevronDown,
  ChevronUp,
} from \"lucide-react\";

const AnalyticsDashboard = ({ projects, balances, selectedNetwork }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timeRange, setTimeRange] = useState(\"all\"); // today, week, all

  // ===== PURE FRONTEND CALCULATIONS (READ ONLY) =====
  
  // Basic Statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.daily === \"CHECKED\").length;
    const pending = projects.filter((p) => p.daily !== \"CHECKED\").length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    // Wallet statistics
    const uniqueWallets = new Set(
      projects.filter((p) => p.wallet).map((p) => p.wallet)
    ).size;

    // Network distribution
    const networkCount = {};
    projects.forEach((p) => {
      if (p.wallet) {
        // Detect network from wallet or default to Ethereum
        const net = \"Ethereum\"; // Can be enhanced to detect actual network
        networkCount[net] = (networkCount[net] || 0) + 1;
      }
    });

    // Social media stats
    const withTwitter = projects.filter((p) => p.twitter).length;
    const withDiscord = projects.filter((p) => p.discord).length;
    const withTelegram = projects.filter((p) => p.telegram).length;

    return {
      total,
      completed,
      pending,
      completionRate,
      uniqueWallets,
      networkCount,
      withTwitter,
      withDiscord,
      withTelegram,
    };
  }, [projects]);

  // Pie Chart Data - Status Distribution
  const pieData = [
    { name: \"Completed\", value: stats.completed, color: \"#22c55e\" },
    { name: \"Pending\", value: stats.pending, color: \"#facc15\" },
  ];

  // Bar Chart Data - Social Media Distribution
  const socialData = [
    { name: \"Twitter\", count: stats.withTwitter, color: \"#1DA1F2\" },
    { name: \"Discord\", count: stats.withDiscord, color: \"#5865F2\" },
    { name: \"Telegram\", count: stats.withTelegram, color: \"#0088cc\" },
  ];

  // Balance Summary
  const balanceSummary = useMemo(() => {
    if (balances.length === 0) return null;

    const validBalances = balances.filter(
      (b) => !b.balance.includes(\"Error\") && !b.balance.includes(\"Invalid\")
    );
    
    const total = validBalances.reduce(
      (sum, b) => sum + parseFloat(b.balance),
      0
    );

    const nonZero = validBalances.filter((b) => parseFloat(b.balance) > 0).length;

    return {
      total: total.toFixed(6),
      count: validBalances.length,
      nonZero,
    };
  }, [balances]);

  // Activity Timeline (last 7 days)
  const activityData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString(\"en-US\", { weekday: \"short\" });
      
      // Mock data - in real app, track this in localStorage
      data.push({
        day: dayName,
        checks: Math.floor(Math.random() * stats.total) + 1,
      });
    }

    return data;
  }, [stats.total]);

  // Store analytics in localStorage for historical tracking
  useEffect(() => {
    const analyticsHistory = {
      date: new Date().toISOString(),
      stats: stats,
      balanceSummary: balanceSummary,
    };

    const history = JSON.parse(localStorage.getItem(\"analytics_history\") || \"[]\");
    history.push(analyticsHistory);
    
    // Keep only last 30 days
    const last30Days = history.slice(-30);
    localStorage.setItem(\"analytics_history\", JSON.stringify(last30Days));
  }, [stats, balanceSummary]);

  return (
    <div className=\"relative z-10 w-full mb-8 fade-in\">
      {/* Header */}
      <div className=\"bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0\">
        <div className=\"p-4 flex justify-between items-center\">
          <h2 className=\"text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2\">
            <Activity size={28} />
            Analytics Dashboard
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className=\"bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2\"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {isExpanded ? \"Collapse\" : \"Expand\"}
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      {isExpanded && (
        <div className=\"bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6 space-y-6\">
          
          {/* Stats Cards Row */}
          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4\">
            {/* Total Projects */}
            <div className=\"bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4 hover:scale-105 transition-transform\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-gray-400 text-sm\">Total Projects</p>
                  <p className=\"text-3xl font-bold text-cyan-400\">{stats.total}</p>
                </div>
                <TrendingUp className=\"text-cyan-400\" size={32} />
              </div>
            </div>

            {/* Completed Tasks */}
            <div className=\"bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4 hover:scale-105 transition-transform\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-gray-400 text-sm\">Completed Today</p>
                  <p className=\"text-3xl font-bold text-green-400\">{stats.completed}</p>
                </div>
                <CheckCircle className=\"text-green-400\" size={32} />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className=\"bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-4 hover:scale-105 transition-transform\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-gray-400 text-sm\">Pending Tasks</p>
                  <p className=\"text-3xl font-bold text-yellow-400\">{stats.pending}</p>
                </div>
                <Clock className=\"text-yellow-400\" size={32} />
              </div>
            </div>

            {/* Completion Rate */}
            <div className=\"bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 hover:scale-105 transition-transform\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-gray-400 text-sm\">Completion Rate</p>
                  <p className=\"text-3xl font-bold text-purple-400\">{stats.completionRate}%</p>
                </div>
                <Activity className=\"text-purple-400\" size={32} />
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className=\"grid grid-cols-1 sm:grid-cols-3 gap-4\">
            {/* Unique Wallets */}
            <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
              <div className=\"flex items-center gap-3\">
                <Wallet className=\"text-yellow-400\" size={24} />
                <div>
                  <p className=\"text-gray-400 text-sm\">Unique Wallets</p>
                  <p className=\"text-xl font-bold text-white\">{stats.uniqueWallets}</p>
                </div>
              </div>
            </div>

            {/* Networks */}
            <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
              <div className=\"flex items-center gap-3\">
                <Network className=\"text-blue-400\" size={24} />
                <div>
                  <p className=\"text-gray-400 text-sm\">Networks Used</p>
                  <p className=\"text-xl font-bold text-white\">
                    {Object.keys(stats.networkCount).length || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Balance Summary */}
            {balanceSummary && (
              <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
                <div className=\"flex items-center gap-3\">
                  <CheckCircle className=\"text-green-400\" size={24} />
                  <div>
                    <p className=\"text-gray-400 text-sm\">Total Balance Checked</p>
                    <p className=\"text-xl font-bold text-green-400\">
                      {balanceSummary.total} {selectedNetwork === \"BSC\" ? \"BNB\" : selectedNetwork === \"Polygon\" ? \"MATIC\" : \"ETH\"}
                    </p>
                    <p className=\"text-xs text-gray-500\">
                      {balanceSummary.nonZero} wallets with balance
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
            {/* Pie Chart - Task Status */}
            <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
              <h3 className=\"text-lg font-semibold text-cyan-400 mb-4\">
                Task Distribution
              </h3>
              <ResponsiveContainer width=\"100%\" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx=\"50%\"
                    cy=\"50%\"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill=\"#8884d8\"
                    dataKey=\"value\"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: \"#1f2937\",
                      border: \"1px solid #374151\",
                      borderRadius: \"8px\",
                      color: \"#fff\",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Social Media */}
            <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
              <h3 className=\"text-lg font-semibold text-cyan-400 mb-4\">
                Social Media Integration
              </h3>
              <ResponsiveContainer width=\"100%\" height={250}>
                <BarChart data={socialData}>
                  <XAxis
                    dataKey=\"name\"
                    stroke=\"#9ca3af\"
                    style={{ fontSize: \"12px\" }}
                  />
                  <YAxis stroke=\"#9ca3af\" style={{ fontSize: \"12px\" }} />
                  <Tooltip
                    contentStyle={{
                      background: \"#1f2937\",
                      border: \"1px solid #374151\",
                      borderRadius: \"8px\",
                      color: \"#fff\",
                    }}
                  />
                  <Bar dataKey=\"count\" radius={[8, 8, 0, 0]}>
                    {socialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
            <h3 className=\"text-lg font-semibold text-cyan-400 mb-4\">
              Daily Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width=\"100%\" height={200}>
              <LineChart data={activityData}>
                <XAxis
                  dataKey=\"day\"
                  stroke=\"#9ca3af\"
                  style={{ fontSize: \"12px\" }}
                />
                <YAxis stroke=\"#9ca3af\" style={{ fontSize: \"12px\" }} />
                <Tooltip
                  contentStyle={{
                    background: \"#1f2937\",
                    border: \"1px solid #374151\",
                    borderRadius: \"8px\",
                    color: \"#fff\",
                  }}
                />
                <Line
                  type=\"monotone\"
                  dataKey=\"checks\"
                  stroke=\"#06b6d4\"
                  strokeWidth={3}
                  dot={{ fill: \"#06b6d4\", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Bar */}
          <div className=\"bg-gray-800/50 border border-gray-700 rounded-xl p-4\">
            <div className=\"flex justify-between items-center mb-2\">
              <h3 className=\"text-lg font-semibold text-cyan-400\">
                Overall Progress
              </h3>
              <span className=\"text-2xl font-bold text-purple-400\">
                {stats.completionRate}%
              </span>
            </div>
            <div className=\"w-full bg-gray-700 rounded-full h-6 overflow-hidden\">
              <div
                className=\"bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2\"
                style={{ width: `${stats.completionRate}%` }}
              >
                <span className=\"text-xs font-semibold text-white\">
                  {stats.completed}/{stats.total}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className=\"bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-pink-600/10 border border-cyan-500/30 rounded-xl p-4\">
            <h3 className=\"text-lg font-semibold text-cyan-400 mb-3\">
              📊 Quick Insights
            </h3>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3 text-sm\">
              <div className=\"flex items-center gap-2\">
                <span className=\"text-green-400\">✓</span>
                <span className=\"text-gray-300\">
                  You've completed <strong className=\"text-green-400\">{stats.completed}</strong> tasks today!
                </span>
              </div>
              <div className=\"flex items-center gap-2\">
                <span className=\"text-yellow-400\">⏱</span>
                <span className=\"text-gray-300\">
                  <strong className=\"text-yellow-400\">{stats.pending}</strong> projects still need attention
                </span>
              </div>
              <div className=\"flex items-center gap-2\">
                <span className=\"text-blue-400\">🌐</span>
                <span className=\"text-gray-300\">
                  Connected to <strong className=\"text-blue-400\">{stats.withTwitter}</strong> Twitter accounts
                </span>
              </div>
              <div className=\"flex items-center gap-2\">
                <span className=\"text-purple-400\">💰</span>
                <span className=\"text-gray-300\">
                  Managing <strong className=\"text-purple-400\">{stats.uniqueWallets}</strong> unique wallets
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
"
