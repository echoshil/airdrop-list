import React from "react";
import {
  Zap,
  Wallet,
  Activity,
  Globe,
  ExternalLink,
} from "lucide-react";

const TradingPlatform = () => {
  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* HEADER BESAR */}
      <div className="text-center py-8 rounded-3xl"
        style={{
          background: '#e0e5ec',
          boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.5)'
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-3">
          <Zap className="text-green-600" size={48} />
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
            DeDoo Trading Platform
          </h2>
        </div>
        <p className="text-gray-700 text-lg">
          Trade crypto with lightning speed & zero fees
        </p>
      </div>

      {/* 3 FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl transition-all"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            >
              <Zap className="text-green-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-green-700">Lightning Fast</h3>
          </div>
          <p className="text-gray-700 text-base leading-relaxed">
            Execute trades in milliseconds with our optimized engine
          </p>
        </div>

        <div className="p-6 rounded-2xl transition-all"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            >
              <Wallet className="text-blue-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-blue-700">Low Fees</h3>
          </div>
          <p className="text-gray-700 text-base leading-relaxed">
            Trade with minimal fees and maximum profit potential
          </p>
        </div>

        <div className="p-6 rounded-2xl transition-all"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl"
              style={{
                boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
              }}
            >
              <Activity className="text-purple-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-purple-700">Real-time Data</h3>
          </div>
          <p className="text-gray-700 text-base leading-relaxed">
            Get live market data and advanced trading charts
          </p>
        </div>
      </div>

      {/* IFRAME CONTAINER */}
      <div className="p-6 rounded-3xl"
        style={{
          background: '#e0e5ec',
          boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.5)'
        }}
      >
        <div className="relative w-full" style={{ height: 'calc(100vh - 450px)', minHeight: '650px' }}>
          <div className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{
              boxShadow: 'inset 6px 6px 12px rgba(163,177,198,0.4), inset -6px -6px 12px rgba(255,255,255,0.3)'
            }}
          >
            <iframe
              src="https://trade.dedoo.xyz/"
              className="w-full h-full"
              title="DeDoo Trading Platform"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>

        {/* OPEN IN NEW TAB BUTTON */}
        <div className="mt-6 flex items-center justify-center">
          <a
            href="https://trade.dedoo.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #3b82f6, #8b5cf6)',
              boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
            }}
          >
            <Globe size={20} />
            <span>Open in New Tab</span>
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TradingPlatform;

