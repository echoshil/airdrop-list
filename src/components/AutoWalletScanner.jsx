import React, { useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";

/**
 * AutoWalletScanner (full multi-chain)
 *
 * - Uses Alchemy SDK for chains supported by Alchemy (full token scan).
 * - Uses ethers + public RPC as fallback to read native balance on other chains.
 * - UI styled similarly to other dashboard cards (gas tracker / analytics / news).
 *
 * Requirements:
 * - VITE_ALCHEMY_API_KEY set in .env (for Alchemy-supported chains)
 * - Optionally add RPC URLs to .env for some chains (key names in rpcMap below)
 */

const supportedChains = [
  // Alchemy first-class (we'll try Alchemy SDK on these)
  "ethereum",
  "arbitrum",
  "optimism",
  "polygon",
  "base",

  // Popular EVMs (fallback via RPC / ethers)
  "bsc",
  "avalanche",
  "fantom",
  "cronos",
  "gnosis",
  "metis",
  "moonbeam",
  "moonriver",
  "celo",
  "klaytn",
  "core",
  "astar",
  "opbnb",
  "scroll",
  "zksync",
  "linea",
  "mantle",
  "mode",
  "blast",
  "taiko",
  "berachain",
  "sei-evm",
  "zetachain",
  "boba",
  "harmony",
  "okx",
  "lukso",
  "shardeum",
];

const chainDisplay = (c) =>
  c
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

const alchemyChains = new Set([
  "ethereum",
  "arbitrum",
  "optimism",
  "polygon",
  "base",
]);

// Minimal mapping to Alchemy Network enum
const alchemyNetworkMap = {
  ethereum: Network.ETH_MAINNET,
  arbitrum: Network.ARB_MAINNET,
  optimism: Network.OPT_MAINNET,
  polygon: Network.MATIC_MAINNET,
  base: Network.BASE_MAINNET,
};

// Fallback RPCs — you can override by providing env vars VITE_RPC_<CHAIN>
// Example: VITE_RPC_BSC, VITE_RPC_AVALANCHE, etc.
const defaultRpcMap = {
  bsc: "https://bsc-dataseed.binance.org/",
  avalanche: "https://api.avax.network/ext/bc/C/rpc",
  fantom: "https://rpc.ftm.tools/",
  cronos: "https://evm-cronos.crypto.org",
  gnosis: "https://rpc.gnosischain.com",
  metis: "https://andromeda.metis.io/?owner=1088",
  moonbeam: "https://rpc.api.moonbeam.network",
  moonriver: "https://rpc.moonriver.moonbeam.network",
  celo: "https://forno.celo.org",
  klaytn: "https://public-node-api.klaytnapi.com/v1/cypress",
  core: "https://mainnet.coredao.org",
  astar: "https://rpc.astar.network:8545",
  opbnb: "https://opbnb-mainnet-rpc.bnbchain.org",
  scroll: "https://scroll.blockpi.network/v1/rpc/public",
  zksync: "https://mainnet.era.zksync.io",
  linea: "https://rpc.linea.build",
  mantle: "https://rpc.mantle.xyz",
  mode: "https://mode-mainnet.public.rpc",
  blast: "https://blastapi.io/rpc",
  taiko: "https://rpc.test.taiko.xyz", // placeholder
  berachain: "https://mainnet.berachain.org", // placeholder
  "sei-evm": "https://rpc-sei-evm.polkachu.com", // placeholder
  zetachain: "https://mainnet.zetachain.com",
  boba: "https://mainnet.boba.network",
  harmony: "https://api.harmony.one",
  okx: "https://exchainrpc.okex.org",
  lukso: "https://rpc.lukso.network",
  shardeum: "https://liberty10.shardeum.org",
};

function getRpcUrl(chain) {
  // allow override from env with key e.g. VITE_RPC_BSC
  const envKey = `VITE_RPC_${chain.toUpperCase().replace(/-/g, "_")}`;
  const envUrl = import.meta.env[envKey];
  if (envUrl) return envUrl;
  return defaultRpcMap[chain] || null;
}

function createAlchemyFor(chain) {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!apiKey) return null;
  const networkEnum = alchemyNetworkMap[chain] || Network.ETH_MAINNET;
  return new Alchemy({
    apiKey,
    network: networkEnum,
  });
}

function createProviderFor(chain) {
  // If chain supported by Alchemy, prefer Alchemy provider if api key present
  if (alchemyChains.has(chain) && import.meta.env.VITE_ALCHEMY_API_KEY) {
    const alchemy = createAlchemyFor(chain);
    if (alchemy) return alchemy.config.getProvider();
  }
  const rpc = getRpcUrl(chain);
  if (!rpc) return null;
  return new ethers.providers.JsonRpcProvider(rpc);
}

export default function AutoWalletScanner() {
  const [chain, setChain] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]); // For ERC20 tokens (Alchemy)
  const [nativeBalance, setNativeBalance] = useState(null); // Fallback: native
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const supportedByAlchemy = alchemyChains.has(chain);

  const fetchForAlchemy = async (addr) => {
    const alchemy = createAlchemyFor(chain);
    if (!alchemy) throw new Error("Alchemy API key not set or unsupported chain.");
    const balances = await alchemy.core.getTokenBalances(addr);
    // filter out zero
    const nonZero = balances.tokenBalances.filter((t) => t.tokenBalance && t.tokenBalance !== "0");
    // get metadata
    const metadataPromises = nonZero.map(async (t) => {
      try {
        const md = await alchemy.core.getTokenMetadata(t.contractAddress);
        const decimals = md.decimals || 18;
        const raw = BigInt(t.tokenBalance || "0");
        const human = Number(raw) / Math.pow(10, decimals);
        return {
          address: t.contractAddress,
          symbol: md.symbol || "???",
          name: md.name || md.symbol || "Unknown",
          logo: md.logo || null,
          balance: human,
          balanceStr: human.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        };
      } catch (e) {
        return {
          address: t.contractAddress,
          symbol: "???",
          name: "Unknown",
          logo: null,
          balance: 0,
          balanceStr: "0",
        };
      }
    });

    const results = await Promise.all(metadataPromises);
    return results;
  };

  const fetchNativeViaProvider = async (addr) => {
    const provider = createProviderFor(chain);
    if (!provider) throw new Error("No RPC configured for this chain.");
    const bal = await provider.getBalance(addr);
    const etherVal = Number(ethers.utils.formatEther(bal));
    return etherVal;
  };

  const handleScan = async () => {
    setError("");
    setInfoMsg("");
    setTokens([]);
    setNativeBalance(null);

    if (!address || !ethers.utils.isAddress(address)) {
      setError("Masukkan address yang valid.");
      return;
    }

    setLoading(true);
    try {
      if (supportedByAlchemy && import.meta.env.VITE_ALCHEMY_API_KEY) {
        setInfoMsg("Menggunakan Alchemy untuk memindai token (full token scan).");
        const res = await fetchForAlchemy(address);
        setTokens(res || []);
        // also fetch native balance via provider (fast)
        try {
          const native = await fetchNativeViaProvider(address);
          setNativeBalance(native);
        } catch (e) {
          // ignore
        }
      } else {
        setInfoMsg(
          "Chain ini belum didukung full token-scan via Alchemy. Akan mengambil saldo native (fallback RPC). " +
            "Untuk token ERC-20 lengkap, sambungkan indexing API (Alchemy, Covalent, atau QuickNode)."
        );
        const native = await fetchNativeViaProvider(address);
        setNativeBalance(native);
      }
    } catch (e) {
      console.error(e);
      setError("Gagal memindai: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center text-white">
        🪙 Auto Wallet Scanner
      </h2>

      {/* Chain selector */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {supportedChains.map((c) => (
          <button
            key={c}
            onClick={() => setChain(c)}
            className={`px-3 py-1 rounded-md text-sm border ${
              chain === c
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            }`}
            title={chainDisplay(c)}
          >
            {c.length <= 8 ? chainDisplay(c) : c}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="text"
          placeholder="Masukkan wallet address (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value.trim())}
          className="flex-1 p-3 rounded-md bg-gray-800 border border-gray-700 text-sm text-white"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="ml-0 sm:ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="text-red-400 mt-3">{error}</p>}
      {infoMsg && <p className="text-gray-300 mt-3">{infoMsg}</p>}

      {/* Results */}
      <div className="mt-5">
        {/* Native balance card */}
        {nativeBalance !== null && (
          <div className="bg-gray-800 p-3 rounded-lg mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-300">Native balance ({chainDisplay(chain)})</div>
              <div className="text-lg font-medium">{nativeBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
            </div>
            <div className="text-xs text-gray-400">Fetched from RPC</div>
          </div>
        )}

        {/* Token list (Alchemy only) */}
        {tokens && tokens.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {tokens.map((t, i) => (
              <div key={t.address + i} className="flex items-center bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  {t.logo ? (
                    <img src={t.logo} alt={t.symbol} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.symbol} • {t.address}</div>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm text-gray-200">{t.balanceStr}</div>
                  <div className="text-xs text-gray-400">tokens</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tokens.length === 0 && nativeBalance === null && !error && (
          <div className="text-center text-gray-400 mt-6">Masukkan wallet dan klik Scan untuk memulai.</div>
        )}

        {!loading && tokens.length === 0 && nativeBalance !== null && (
          <div className="text-gray-400 mt-3 text-sm">
            Token ERC-20 tidak ditampilkan untuk chain ini (atau tidak ada token non-zero). Untuk daftar token lengkap, pakai Alchemy-supported chains atau tambahkan indexing API.
          </div>
        )}
      </div>
    </div>
  );
}
