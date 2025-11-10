import React from "react";
import { Zap, Wallet, Activity, Globe, ExternalLink } from "lucide-react";

export default function TradingPlatform() {
  const features = [
    {
      icon: <Zap className="text-green-600" size={20} />,
      title: "Lightning Fast",
      desc: "Execute trades instantly with our optimized engine",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <Wallet className="text-blue-600" size={20} />,
      title: "Low Fees",
      desc: "Trade with minimal fees and maximize your profits",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Activity className="text-purple-600" size={20} />,
      title: "Real-time Data",
      desc: "Get live market data and advanced trading charts",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-6">
      {/* HEADER */}
      <div
        className="text-center py-6 md:py-8 rounded-2xl shadow-inner"
        style={{
          background: "#e3e7ee",
          boxShadow:
            "6px 6px 12px rgba(163,177,198,0.4), -6px -6px 12px rgba(255,255,255,0.7)",
        }}
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
          <Zap className="text-green-600" size={26} />
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
            DeDoo Trading Platform
          </h2>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          Trade crypto with lightning speed & zero fees
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-5 md:p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: "#e3e7ee",
              boxShadow:
                "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.6)",
            }}
          >
            <div
              className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl"
              style={{
                boxShadow:
                  "inset 2px 2px 4px rgba(163,177,198,0.4), inset -2px -2px 4px rgba(255,255,255,0.5)",
              }}
            >
              {f.icon}
            </div>
            <h3
              className={`font-semibold text-base md:text-lg bg-gradient-to-r ${f.color} text-transparent bg-clip-text mb-1`}
            >
              {f.title}
            </h3>
            <p className="text-gray-700 text-sm leading-snug max-w-xs mx-auto">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* IFRAME CONTAINER */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#e3e7ee",
          boxShadow:
            "6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.6)",
        }}
      >
        <iframe
          src="https://trade.dedoo.xyz/"
          className="w-full"
          style={{ height: "75vh", minHeight: "480px" }}
          title="DeDoo Trading Platform"
          loading="lazy"
        />
      </div>

      {/* OPEN IN NEW TAB BUTTON */}
      <div className="flex justify-center">
        <a
          href="https://trade.dedoo.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm md:text-base transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(145deg, #3b82f6, #8b5cf6)",
            boxShadow:
              "6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.6)",
          }}
        >
          <Globe size={18} />
          <span>Open in New Tab</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
