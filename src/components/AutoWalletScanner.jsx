import React, { useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { Wallet } from "lucide-react";

const AutoWalletScanner = () => {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chain, setChain] = useState("eth-mainnet");

  // === Alchemy Config ===
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

  // 🎨 NEUMORPHIC THEME (sama persis GasTracker)
  const baseBg = "bg-[#e0e5ec]";
  const neuCard =
    "rounded-3xl p-6 shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff]";
  const neuInset =
    "shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]";
  const neuButton =
    "rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition text-gray-700 font-semibold";

  return (
    <div className={`max-w-2xl mx-auto mt-10 space-y-6 ${baseBg}`}>
      {/* Header */}
      <div className={`${neuCard} ${baseBg} flex items-center justify-center gap-3`}>
        <Wallet className="text-blue-500" size={26} />
        <h2 className="text-2xl font-bold text-gray-700">🪙 Auto Wallet Scanner</h2>
      </div>

      {/* Chain Selector */}
      <div className={`${neuCard} ${baseBg} flex flex-wrap justify-center gap-3 p-4`}>
        {["eth-mainnet", "arbitrum", "polygon", "base"].map((c) => (
          <button
            key={c}
            onClick={() => setChain(c)}
            className={`${neuButton} ${baseBg} px-6 py-2 ${
              chain === c
                ? "text-white bg-gradient-to-r from-orange-400 to-pink-400"
                : ""
            }`}
          >
            {c === "eth-mainnet"
              ? "Ethereum"
              : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className={`${neuCard} ${baseBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Masukkan wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`flex-1 ${baseBg} text-gray-700 rounded-xl px-4 py-2 ${neuInset} focus:outline-none text-sm`}
          />
          <button
            onClick={fetchTokens}
            disabled={loading}
            className={`${neuButton} px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white active:from-blue-600 active:to-blue-700`}
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center font-medium">{error}</p>
        )}
      </div>

      {/* Token List */}
      {tokens.length > 0 && (
        <div
          className={`${neuCard} ${baseBg} space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300`}
        >
          {tokens.map((t, i) => (
            <div
              key={i}
              className={`${baseBg} flex items-center justify-between px-4 py-3 rounded-2xl ${neuInset}`}
            >
              <div className="flex items-center gap-3">
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="w-7 h-7 rounded-full shadow-md"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-300" />
                )}
                <span className="text-gray-700 font-medium text-sm">
                  {t.name} ({t.symbol})
                </span>
              </div>
              <span className="text-gray-600 text-sm font-semibold">
                {t.balance}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <div className={`${neuCard} ${baseBg} text-center text-gray-500 text-sm`}>
          Masukkan wallet dan klik <b>Scan</b> untuk melihat token yang dimiliki.
        </div>
      )}
    </div>
  );
};

export default AutoWalletScanner;
