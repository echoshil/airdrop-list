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

  // 🎨 Neumorphic style helpers
  const neu = {
    bg: "#e9eef6",
    surface: "#f6fbff",
    shadowDark: "rgba(163,177,198,0.6)",
    shadowLight: "rgba(255,255,255,0.9)",
  };

  const neuSoft = {
    background: neu.surface,
    boxShadow: `6px 6px 12px ${neu.shadowDark}, -6px -6px 12px ${neu.shadowLight}`,
    borderRadius: "20px",
  };

  const neuInset = {
    background: neu.surface,
    boxShadow: `inset 3px 3px 6px ${neu.shadowDark}, inset -3px -3px 6px ${neu.shadowLight}`,
  };

  return (
    <div
      style={{
        ...neuSoft,
        padding: "2rem",
        maxWidth: "600px",
        margin: "40px auto",
        color: "#1f2937",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.8rem",
          fontWeight: "700",
          marginBottom: "1rem",
          color: "#334155",
          textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
        }}
      >
        🪙 Auto Wallet Scanner
      </h2>

      {/* Pilih chain */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        {["eth-mainnet", "arbitrum", "polygon", "base"].map((c) => (
          <button
            key={c}
            onClick={() => setChain(c)}
            style={{
              padding: "6px 12px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              background:
                chain === c
                  ? "linear-gradient(145deg, #a5b4fc, #818cf8)"
                  : neu.surface,
              boxShadow:
                chain === c
                  ? "inset 2px 2px 4px rgba(163,177,198,0.6), inset -2px -2px 4px rgba(255,255,255,0.9)"
                  : "2px 2px 5px rgba(163,177,198,0.6), -2px -2px 5px rgba(255,255,255,0.9)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {c === "eth-mainnet"
              ? "Ethereum"
              : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Input wallet */}
      <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Masukkan wallet address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "14px",
            border: "none",
            fontSize: "0.9rem",
            outline: "none",
            ...neuInset,
          }}
        />
        <button
          onClick={fetchTokens}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontWeight: 600,
            background: loading
              ? "linear-gradient(145deg, #a1a1aa, #71717a)"
              : "linear-gradient(145deg, #60a5fa, #3b82f6)",
            boxShadow: "3px 3px 6px rgba(163,177,198,0.6), -3px -3px 6px rgba(255,255,255,0.9)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
      )}

      {/* Daftar token */}
      {tokens.length > 0 && (
        <div style={{ marginTop: "1.5rem", maxHeight: "320px", overflowY: "auto" }}>
          {tokens.map((t, idx) => (
            <div
              key={idx}
              style={{
                ...neuSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.8rem 1rem",
                marginBottom: "0.8rem",
                borderRadius: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {t.logo ? (
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      ...neuInset,
                    }}
                  />
                )}
                <span style={{ fontSize: "0.9rem", color: "#334155" }}>
                  {t.name} ({t.symbol})
                </span>
              </div>
              <span style={{ color: "#475569", fontWeight: 600 }}>{t.balance}</span>
            </div>
          ))}
        </div>
      )}

      {!loading && tokens.length === 0 && !error && (
        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "0.9rem",
            marginTop: "1.5rem",
          }}
        >
          Masukkan wallet dan klik <b>Scan</b> untuk melihat token yang dimiliki.
        </p>
      )}
    </div>
  );
};

export default AutoWalletScanner;
