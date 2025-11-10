import React, { useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";

const AutoWalletScanner = () => {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chain, setChain] = useState("eth-mainnet");

  // Konfigurasi default (Ethereum)
  const getAlchemy = () => {
    const settings = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network:
        chain === "eth-mainnet"
          ? Network.ETH_MAINNET
          : chain === "arbitrum"
          ? Network.ARB_MAINNET
          : chain === "polygon"
          ? Network.MATIC_MAINNET
          : chain === "base"
          ? Network.BASE_MAINNET
          : Network.ETH_MAINNET,
    };
    return new Alchemy(settings);
  };

  const fetchTokens = async () => {
    if (!address) {
      setError("Masukkan wallet address terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const alchemy = getAlchemy();
      const balances = await alchemy.core.getTokenBalances(address);
      const nonZeroTokens = balances.tokenBalances.filter(
        (t) => t.tokenBalance !== "0"
      );

      const metadataPromises = nonZeroTokens.map(async (token) => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const balance =
          Number(token.tokenBalance) / Math.pow(10, metadata.decimals || 18);

        return {
          name: metadata.name || "Unknown",
          symbol: metadata.symbol || "???",
          logo: metadata.logo,
          balance: balance.toFixed(4),
        };
      });

      const results = await Promise.all(metadataPromises);
      setTokens(results);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data token. Periksa address dan API key kamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        🪙 Auto Wallet Scanner
      </h2>

      {/* Pilih chain */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {["eth-mainnet", "arbitrum", "polygon", "base"].map((c) => (
          <button
            key={c}
            onClick={() => setChain(c)}
            className={`px-3 py-1 rounded-md text-sm ${
              chain === c ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {c === "eth-mainnet"
              ? "Ethereum"
              : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Input wallet */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Masukkan wallet address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-sm"
        />
        <button
          onClick={fetchTokens}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* Daftar token */}
      {tokens.length > 0 && (
        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
          {tokens.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center bg-gray-800 p-3 rounded-lg justify-between"
            >
              <div className="flex items-center gap-2">
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700" />
                )}
                <span className="text-sm">
                  {t.name} ({t.symbol})
                </span>
              </div>
              <span className="text-gray-300 text-sm">{t.balance}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <p className="text-gray-400 text-center mt-6 text-sm">
          Masukkan wallet dan klik <b>Scan</b> untuk melihat token yang dimiliki.
        </p>
      )}
    </div>
  );
};

export default AutoWalletScanner;
