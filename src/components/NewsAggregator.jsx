import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NewsAggregator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [news, setNews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending"); // trending, latest, sentiment

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
  ];

  // Sample initial news
  const sampleNews = [
    {
      id: 1,
      title: "LayerZero Announces Snapshot Date for Airdrop",
      description:
        "LayerZero confirms airdrop eligibility snapshot on March 2024. Users who interacted with the protocol before this date qualify.",
      source: "Twitter @LayerZero_Labs",
      category: "layer2",
      url: "https://twitter.com/layerzero_labs",
      sentiment: "bullish",
      votes: 45,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      title: "zkSync Era Introduces New Fee Model",
      description:
        "zkSync announces reduced gas fees by 70% with new compression algorithm. Great news for airdrop farmers!",
      source: "Discord @zkSync",
      category: "layer2",
      url: "https://zksync.io",
      sentiment: "bullish",
      votes: 38,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      title: "Blur Season 2 Rewards Distribution Delayed",
      description:
        "Blur team announces delay in Season 2 rewards due to smart contract audit. New date TBA.",
      source: "Telegram @BlurOfficial",
      category: "nft",
      url: "https://blur.io",
      sentiment: "bearish",
      votes: 12,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 4,
      title: "Starknet Foundation Hints at Token Launch",
      description:
        "Community discussion reveals potential Starknet token launch in Q2 2024. Airdrop to early users expected.",
      source: "Twitter @StarknetFDN",
      category: "layer2",
      url: "https://starknet.io",
      sentiment: "bullish",
      votes: 67,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 5,
      title: "Arbitrum Expands Gaming Ecosystem with 5 New Partners",
      description:
        "Arbitrum announces partnerships with major gaming studios. Increased activity expected for airdrop eligibility.",
      source: "Website Arbitrum.io",
      category: "gamefi",
      url: "https://arbitrum.io",
      sentiment: "bullish",
      votes: 29,
      timestamp: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("airdrop_news");
    if (saved) {
      setNews(JSON.parse(saved));
    } else {
      setNews(sampleNews);
      localStorage.setItem("airdrop_news", JSON.stringify(sampleNews));
    }
  }, []);

  // Add news
  const addNews = () => {
    if (!formData.title || !formData.description) {
      alert("⚠️ Title and description are required!");
      return;
    }

    const newNews = {
      id: Date.now(),
      ...formData,
      sentiment: analyzeSentiment(formData.description),
      votes: 0,
      timestamp: new Date().toISOString(),
    };

    const updated = [newNews, ...news];
    setNews(updated);
    localStorage.setItem("airdrop_news", JSON.stringify(updated));

    // Reset form
    setFormData({
      title: "",
      description: "",
      source: "",
      category: "defi",
      url: "",
    });
    setShowAddForm(false);
  };

  // Simple sentiment analysis (keyword-based)
  const analyzeSentiment = (text) => {
    const bullishKeywords = [
      "airdrop",
      "launch",
      "reward",
      "snapshot",
      "distribution",
      "partnership",
      "expansion",
      "growth",
      "announcement",
      "new",
      "confirmed",
    ];
    const bearishKeywords = [
      "delay",
      "postpone",
      "cancel",
      "issue",
      "problem",
      "warning",
      "scam",
      "hack",
      "down",
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

  // Vote handler
  const handleVote = (newsId, type) => {
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
    localStorage.setItem("airdrop_news", JSON.stringify(updated));
  };

  // Delete news
  const deleteNews = (newsId) => {
    const updated = news.filter((item) => item.id !== newsId);
    setNews(updated);
    localStorage.setItem("airdrop_news", JSON.stringify(updated));
  };

  // Filter and sort
  const filteredNews = news
    .filter((item) =>
      filterCategory === "all" ? true : item.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "trending") return b.votes - a.votes;
      if (sortBy === "latest")
        return new Date(b.timestamp) - new Date(a.timestamp);
      // Sort by sentiment: bullish > neutral > bearish
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

  return (
    <div className="relative z-10 w-full mb-8 fade-in">
      {/* Header */}
      <div className="bg-gray-900/60 backdrop-blur-md rounded-t-2xl border border-gray-700 border-b-0">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
            <Newspaper size={28} />
            🤖 Airdrop News Aggregator
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
                />

                <textarea
                  placeholder="Description *"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none resize-none"
                  rows="3"
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
                  />

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white outline-none"
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
                  />
                </div>

                <button
                  onClick={addNews}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Submit News
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* News Feed */}
          <div className="space-y-4">
            {filteredNews.length === 0 ? (
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
                  >
                    <div className="flex justify-between items-start gap-4">
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
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
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📡 {item.source}</span>
                          <span>
                            🕒{" "}
                            {new Date(item.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
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
                          onClick={() => handleVote(item.id, "up")}
                          className="text-green-400 hover:text-green-300 transition"
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
                        >
                          {item.votes}
                        </span>
                        <button
                          onClick={() => handleVote(item.id, "down")}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <ThumbsDown size={18} />
                        </button>
                        <button
                          onClick={() => deleteNews(item.id)}
                          className="mt-2 text-gray-500 hover:text-red-400 transition"
                        >
                          <X size={16} />
                        </button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Total News:</span>
                <span className="ml-2 font-semibold text-white">
                  {news.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bullish:</span>
                <span className="ml-2 font-semibold text-green-400">
                  {news.filter((n) => n.sentiment === "bullish").length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Bearish:</span>
                <span className="ml-2 font-semibold text-red-400">
                  {news.filter((n) => n.sentiment === "bearish").length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Most Voted:</span>
                <span className="ml-2 font-semibold text-yellow-400">
                  {news.length > 0
                    ? Math.max(...news.map((n) => n.votes))
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

