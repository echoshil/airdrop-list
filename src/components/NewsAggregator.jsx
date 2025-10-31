import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const NewsAggregator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [news, setNews] = useState([]);
  const [apiNews, setApiNews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "",
    category: "defi",
    url: "",
  });

  const categories = [
    { id: "all", label: "All", color: "bg-gray-600" },
    { id: "defi", label: "DeFi", color: "bg-blue-500" },
    { id: "gamefi", label: "GameFi", color: "bg-purple-500" },
    { id: "layer2", label: "Layer2", color: "bg-green-500" },
    { id: "nft", label: "NFT", color: "bg-pink-500" },
    { id: "bridge", label: "Bridge", color: "bg-indigo-500" },
    { id: "socialfi", label: "SocialFi", color: "bg-orange-500" },
    { id: "airdrop", label: "Airdrop", color: "bg-yellow-500" },
  ];

  // Fetch news from CoinGecko API
  const fetchCryptoNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // CoinGecko Public News API
      const response = await axios.get("https://api.coingecko.com/api/v3/news", {
        timeout: 10000,
      });

      if (response.data && response.data.data) {
        // Transform CoinGecko news to our format
        const transformedNews = response.data.data.slice(0, 20).map((item, index) => ({
          id: `api-${item.id || Date.now() + index}`,
          title: item.title || "No Title",
          description: item.description || item.news_site || "No description available",
          source: item.news_site || "CoinGecko",
          category: detectCategory(item.title + " " + (item.description || "")),
          url: item.url || "#",
          sentiment: analyzeSentiment(item.title + " " + (item.description || "")),
          votes: 0,
          timestamp: item.updated_at || new Date().toISOString(),
          isFromApi: true,
          thumb_2x: item.thumb_2x || null,
        }));

        setApiNews(transformedNews);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Error fetching crypto news:", err);
      setError("Failed to fetch news. Using cached data.");
      
      // Fallback: use sample data if API fails
      if (apiNews.length === 0) {
        setApiNews(getSampleNews());
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiNews.length]);

  // Auto-detect category from text
  const detectCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/airdrop|claim|snapshot|distribution|reward/i)) return "airdrop";
    if (lowerText.match(/defi|lending|yield|stake|liquidity/i)) return "defi";
    if (lowerText.match(/game|play to earn|p2e|metaverse/i)) return "gamefi";
    if (lowerText.match(/layer 2|l2|rollup|zk|optimistic|arbitrum|polygon/i)) return "layer2";
    if (lowerText.match(/nft|non-fungible|opensea|collectible/i)) return "nft";
    if (lowerText.match(/bridge|cross-chain|multichain/i)) return "bridge";
    if (lowerText.match(/social|community|dao/i)) return "socialfi";
    
    return "defi"; // default
  };

  // Simple sentiment analysis
  const analyzeSentiment = (text) => {
    const bullishKeywords = [
      "airdrop", "launch", "reward", "snapshot", "distribution",
      "partnership", "expansion", "growth", "announcement", "new",
      "confirmed", "bullish", "gain", "profit", "rise", "up", "surge",
      "breakthrough", "adoption", "milestone"
    ];
    
    const bearishKeywords = [
      "delay", "postpone", "cancel", "issue", "problem",
      "warning", "scam", "hack", "down", "crash", "bearish",
      "loss", "decline", "drop", "fall", "risk", "fraud"
    ];

    const lowerText = text.toLowerCase();
    const bullishCount = bullishKeywords.filter((word) =>
      lowerText.includes(word)
    ).length;
    const bearishCount = bearishKeywords.filter((word) =>
      lowerText.includes(word)
    ).length;

    if (bullishCount > bearishCount) return "bullish";
    if (bearishCount > bullishCount) return "bearish";
    return "neutral";
  };

  // Sample news fallback
  const getSampleNews = () => [
    {
      id: "sample-1",
      title: "Major L2 Protocol Announces Airdrop Snapshot",
      description: "Leading Layer 2 solution confirms airdrop eligibility snapshot. Early users who interacted before deadline will qualify for rewards.",
      source: "CryptoNews",
      category: "airdrop",
      url: "#",
      sentiment: "bullish",
      votes: 45,
      timestamp: new Date().toISOString(),
      isFromApi: true,
    },
    {
      id: "sample-2",
      title: "DeFi Protocol Launches New Yield Farming Program",
      description: "Popular DeFi platform introduces high-yield farming opportunities with reduced gas fees.",
      source: "DeFi Pulse",
      category: "defi",
      url: "#",
      sentiment: "bullish",
      votes: 32,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isFromApi: true,
    },
  ];

  // Load manual news from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("airdrop_news_manual");
    if (saved) {
      setNews(JSON.parse(saved));
    }
  }, []);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchCryptoNews();

    // Auto-refresh every 10 minutes
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCryptoNews();
      }, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchCryptoNews]);

  // Add manual news
  const addNews = () => {
    if (!formData.title || !formData.description) {
      alert("⚠️ Title and description are required!");
      return;
    }

    const newNews = {
      id: `manual-${Date.now()}`,
      ...formData,
      sentiment: analyzeSentiment(formData.description),
      votes: 0,
      timestamp: new Date().toISOString(),
      isFromApi: false,
    };

    const updated = [newNews, ...news];
    setNews(updated);
    localStorage.setItem("airdrop_news_manual", JSON.stringify(updated));

    setFormData({
      title: "",
      description: "",
      source: "",
      category: "defi",
      url: "",
    });
    setShowAddForm(false);
  };

  // Vote handler
  const handleVote = (newsId, type, isApi) => {
    if (isApi) {
      const updated = apiNews.map((item) => {
        if (item.id === newsId) {
          return {
            ...item,
            votes: type === "up" ? item.votes + 1 : item.votes - 1,
          };
        }
        return item;
      });
      setApiNews(updated);
    } else {
      const updated = news.map((item) => {
        if (item.id === newsId) {
          return {
            ...item,
            votes: type === "up" ? item.votes + 1 : item.votes - 1,
          };
        }
        return item;
      });
      setNews(updated);
      localStorage.setItem("airdrop_news_manual", JSON.stringify(updated));
    }
  };

  // Delete manual news
  const deleteNews = (newsId) => {
    const updated = news.filter((item) => item.id !== newsId);
    setNews(updated);
    localStorage.setItem("airdrop_news_manual", JSON.stringify(updated));
  };

  // Combine and filter news
  const allNews = [...apiNews, ...news];
  const filteredNews = allNews
    .filter((item) =>
      filterCategory === "all" ? true : item.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "trending") return b.votes - a.votes;
      if (sortBy === "latest")
        return new Date(b.timestamp) - new Date(a.timestamp);
      const sentimentOrder = { bullish: 3, neutral: 2, bearish: 1 };
      return sentimentOrder[b.sentiment] - sentimentOrder[a.sentiment];
    });

  const getSentimentBadge = (sentiment) => {
    const badges = {
      bullish: {
        color: "bg-green-600/20 text-green-400 border-green-500/30",
        label: "🐂 Bullish",
      },
      bearish: {
        color: "bg-red-600/20 text-red-400 border-red-500/30",
        label: "🐻 Bearish",
      },
      neutral: {
        color: "bg-gray-600/20 text-gray-400 border-gray-500/30",
        label: "😐 Neutral",
      },
    };
    return badges[sentiment];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative z-10 w-full mb-8 fade-in">
      {/* Header */}
      <div className="bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0">
        <div className="p-4 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
              <Newspaper size={28} />
              🤖 Airdrop News Aggregator
            </h2>
            {isLoading && (
              <RefreshCw size={20} className="text-cyan-400 animate-spin" />
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={16} />
                <span>Updated {formatTimestamp(lastUpdate)}</span>
              </div>
            )}
            
            {/* Manual Refresh Button */}
            <button
              onClick={fetchCryptoNews}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm"
              data-testid="refresh-news-btn"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            
            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg transition text-sm ${
                autoRefresh
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              data-testid="auto-refresh-toggle"
            >
              Auto: {autoRefresh ? "ON" : "OFF"}
            </button>
            
            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {isExpanded ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="px-4 pb-3">
            <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2 text-yellow-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="bg-gray-900/60 backdrop-blur-md rounded-b-2xl border border-gray-700 p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer text-sm"
                  data-testid="category-filter"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <TrendingUp size={16} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer text-sm"
                  data-testid="sort-by"
                >
                  <option value="trending">Trending</option>
                  <option value="latest">Latest</option>
                  <option value="sentiment">Sentiment</option>
                </select>
              </div>
            </div>

            {/* Add News Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 px-4 py-2 rounded-lg font-semibold transition"
              data-testid="add-news-btn"
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? "Cancel" : "Add News"}
            </button>
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3"
              >
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <Sparkles size={20} />
                  Submit New Airdrop News
                </h3>

                <input
                  type="text"
                  placeholder="News Title *"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                  data-testid="news-title-input"
                />

                <textarea
                  placeholder="Description *"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none resize-none"
                  rows="3"
                  data-testid="news-description-input"
                ></textarea>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Source (e.g., Twitter @xyz)"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                    data-testid="news-source-input"
                  />

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                    data-testid="news-category-select"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>

                  <input
                    type="url"
                    placeholder="URL (optional)"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
                    data-testid="news-url-input"
                  />
                </div>

                <button
                  onClick={addNews}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 px-6 py-3 rounded-lg font-semibold transition"
                  data-testid="submit-news-btn"
                >
                  Submit News
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* News Feed */}
          <div className="space-y-4" data-testid="news-feed">
            {isLoading && filteredNews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                <p>Loading crypto news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No news available for this category</p>
              </div>
            ) : (
              filteredNews.map((item) => {
                const sentiment = getSentimentBadge(item.sentiment);
                const categoryData = categories.find(
                  (c) => c.id === item.category
                );

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-cyan-500/50 transition"
                    data-testid={`news-item-${item.id}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${categoryData.color} text-white font-semibold`}
                          >
                            {categoryData.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${sentiment.color} font-semibold`}
                          >
                            {sentiment.label}
                          </span>
                          {item.isFromApi && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold">
                              🌐 Live
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span>📡 {item.source}</span>
                          <span>🕒 {formatTimestamp(item.timestamp)}</span>
                          {item.url && item.url !== "#" && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                              data-testid={`news-source-link-${item.id}`}
                            >
                              <ExternalLink size={12} />
                              Source
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Voting & Actions */}
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleVote(item.id, "up", item.isFromApi)}
                          className="text-green-400 hover:text-green-300 transition"
                          data-testid={`upvote-btn-${item.id}`}
                        >
                          <ThumbsUp size={18} />
                        </button>
                        <span
                          className={`font-bold ${
                            item.votes > 0
                              ? "text-green-400"
                              : item.votes < 0
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                          data-testid={`vote-count-${item.id}`}
                        >
                          {item.votes}
                        </span>
                        <button
                          onClick={() => handleVote(item.id, "down", item.isFromApi)}
                          className="text-red-400 hover:text-red-300 transition"
                          data-testid={`downvote-btn-${item.id}`}
                        >
                          <ThumbsDown size={18} />
                        </button>
                        {!item.isFromApi && (
                          <button
                            onClick={() => deleteNews(item.id)}
                            className="mt-2 text-gray-500 hover:text-red-400 transition"
                            data-testid={`delete-btn-${item.id}`}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Stats Footer */}
          <div className="bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 border border-orange-500/30 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">
              📊 Community Insights
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Total News:</span>
                <span className="ml-2 font-semibold text-white">
                  {allNews.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">API News:</span>
                <span className="ml-2 font-semibold text-blue-400">
                  {apiNews.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bullish:</span>
                <span className="ml-2 font-semibold text-green-400">
                  {allNews.filter((n) => n.sentiment === "bullish").length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bearish:</span>
                <span className="ml-2 font-semibold text-red-400">
                  {allNews.filter((n) => n.sentiment === "bearish").length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Most Voted:</span>
                <span className="ml-2 font-semibold text-yellow-400">
                  {allNews.length > 0
                    ? Math.max(...allNews.map((n) => n.votes))
                    : 0}{" "}
                  votes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAggregator;
