import React, { useState } from "react";
import { Wallet, RefreshCw } from "lucide-react";
import { ethers } from "ethers";

const NETWORKS = {
  Ethereum: { rpc: "https://eth.llamarpc.com" },
  Polygon: { rpc: "https://polygon-rpc.com" },
  BSC: { rpc: "https://bsc-dataseed.binance.org" },
  Arbitrum: { rpc: "https://arb1.arbitrum.io/rpc" },
  Base: { rpc: "https://mainnet.base.org" },
};

export default function BulkBalanceChecker() {
  const [addresses, setAddresses] = useState("");
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [quickAddress, setQuickAddress] = useState("");
  const [quickResult, setQuickResult] = useState(null);

  // === Fungsi ambil balance dari banyak address ===
  const handleBulkCheck = async () => {
    setLoading(true);
    const addrList = addresses
      .split("\n")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    const result = {};

    for (const netName in NETWORKS) {
      const provider = new ethers.JsonRpcProvider(NETWORKS[netName].rpc);
      result[netName] = [];

      for (const addr of addrList) {
        try {
          const balance = await provider.getBalance(addr);
          result[netName].push({
            address: addr,
            balance: ethers.formatEther(balance),
          });
        } catch (e) {
          result[netName].push({
            address: addr,
            balance: "Error",
          });
        }
      }
    }

    setBalances(result);
    setLoading(false);
  };

  // === Fungsi Quick Network Checker ===
  const handleQuickCheck = async () => {
    if (!quickAddress) return;
    setQuickResult(null);
    const data = [];

    for (const [net, val] of Object.entries(NETWORKS)) {
      try {
        const provider = new ethers.JsonRpcProvider(val.rpc);
        const bal = await provider.getBalance(quickAddress);
        data.push({ network: net, balance: ethers.formatEther(bal) });
      } catch (e) {
        data.push({ network: net, balance: "Error" });
      }
    }

    setQuickResult(data);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div
        className="text-center py-6 rounded-2xl"
        style={{
          background: "#e3e7ee",
          boxShadow:
            "4px 4px 8px rgba(163,177,198,0.4), -4px -4px 8px rgba(255,255,255,0.6)",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <Wallet className="text-indigo-600" size={28} />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
            Bulk Balance Checker
          </h2>
        </div>
        <p className="text-gray-600 text-sm">
          Check EVM native & token balances across multiple networks instantly.
        </p>
      </div>

      {/* BULK CHECKER */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "#e3e7ee",
          boxShadow:
            "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.6)",
        }}
      >
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          🧾 EVM Native & Tokens Balance Checker
        </h3>
        <textarea
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          placeholder="Paste one or more addresses, each on a new line"
          rows={5}
          className="w-full rounded-xl p-3 border border-gray-300 text-sm"
        />
        <button
          onClick={handleBulkCheck}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Checking..." : "Check Balances"}
        </button>

        {/* Result Table */}
        {Object.keys(balances).length > 0 && (
          <div className="mt-4 space-y-4">
            {Object.entries(balances).map(([net, list]) => (
              <div key={net}>
                <h4 className="font-semibold text-gray-700 mb-2">{net}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Address</th>
                        <th className="p-2 text-left">Balance (ETH)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((item, i) => (
                        <tr
                          key={i}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="p-2 font-mono text-xs">{item.address}</td>
                          <td className="p-2">{item.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK CHECKER */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "#e3e7ee",
          boxShadow:
            "4px 4px 8px rgba(163,177,198,0.5), -4px -4px 8px rgba(255,255,255,0.6)",
        }}
      >
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          ⚡ Quick Network Balance Checker
        </h3>
        <input
          value={quickAddress}
          onChange={(e) => setQuickAddress(e.target.value)}
          placeholder="Enter wallet address..."
          className="w-full rounded-xl p-3 border border-gray-300 text-sm"
        />
        <button
          onClick={handleQuickCheck}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition-transform"
        >
          <RefreshCw size={18} />
          Check Balance
        </button>

        {quickResult && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Network</th>
                  <th className="p-2 text-left">Balance (ETH)</th>
                </tr>
              </thead>
              <tbody>
                {quickResult.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-2">{row.network}</td>
                    <td className="p-2">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
