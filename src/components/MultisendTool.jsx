import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Send, AlertCircle, CheckCircle, Loader, ExternalLink } from "lucide-react";

// ERC20 ABI - only transfer function needed
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Supported EVM Networks
const EVM_NETWORKS = {
  1: { name: "Ethereum", symbol: "ETH", rpc: "https://eth.llamarpc.com", explorer: "https://etherscan.io" },
  56: { name: "BSC", symbol: "BNB", rpc: "https://bsc-dataseed.binance.org", explorer: "https://bscscan.com" },
  137: { name: "Polygon", symbol: "MATIC", rpc: "https://polygon-rpc.com", explorer: "https://polygonscan.com" },
  42161: { name: "Arbitrum", symbol: "ETH", rpc: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", symbol: "ETH", rpc: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io" },
  8453: { name: "Base", symbol: "ETH", rpc: "https://mainnet.base.org", explorer: "https://basescan.org" },
  43114: { name: "Avalanche", symbol: "AVAX", rpc: "https://api.avax.network/ext/bc/C/rpc", explorer: "https://snowtrace.io" },
  250: { name: "Fantom", symbol: "FTM", rpc: "https://rpc.ftm.tools", explorer: "https://ftmscan.com" },
};

function MultisendTool() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [sendType, setSendType] = useState("native");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [recipients, setRecipients] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [txResults, setTxResults] = useState([]);
  const [error, setError] = useState("");

  // === WALLET CONNECT FUNCTIONS (no change) ===
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("❌ Please install MetaMask or any EVM wallet!");
        return;
      }
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await tempProvider.send("eth_requestAccounts", []);
      const tempSigner = await tempProvider.getSigner();
      const network = await tempProvider.getNetwork();
      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else setAccount(accounts[0]);
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
    setTokenInfo(null);
  };

  // === BALANCE FETCHING (no change) ===
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !provider) return;
      try {
        if (sendType === "native") {
          const bal = await provider.getBalance(account);
          setBalance(ethers.formatEther(bal));
        } else if (sendType === "token" && tokenAddress && ethers.isAddress(tokenAddress)) {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const decimals = await contract.decimals();
          const bal = await contract.balanceOf(account);
          setBalance(ethers.formatUnits(bal, decimals));
        }
      } catch (err) {
        setBalance("Error");
      }
    };
    fetchBalance();
  }, [account, provider, sendType, tokenAddress]);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (sendType !== "token" || !tokenAddress || !provider) {
        setTokenInfo(null);
        return;
      }
      try {
        if (!ethers.isAddress(tokenAddress)) {
          setTokenInfo(null);
          return;
        }
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        setTokenInfo({ symbol, decimals });
      } catch {
        setTokenInfo(null);
      }
    };
    fetchTokenInfo();
  }, [tokenAddress, provider, sendType]);

  const parseRecipients = () => {
    const lines = recipients.split("\n").filter((line) => line.trim());
    const parsed = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length === 2) {
        const [address, amount] = parts;
        if (ethers.isAddress(address) && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
          parsed.push({ address, amount: parseFloat(amount) });
        }
      }
    }
    return parsed;
  };

  const getTotalAmount = () => {
    const parsed = parseRecipients();
    return parsed.reduce((sum, item) => sum + item.amount, 0).toFixed(6);
  };

  // === EXECUTION (no change) ===
  const executeMultisend = async () => { /* ... same code ... */ };

  const currentNetwork = chainId ? EVM_NETWORKS[chainId] : null;
  const networkSymbol = currentNetwork?.symbol || "TOKEN";
  const explorer = currentNetwork?.explorer || "";

  // === NEUMORPHIC STYLE RENDER ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0e0e0] py-10">
      <div className="max-w-4xl w-full p-8 rounded-3xl bg-[#e0e0e0] shadow-[9px_9px_16px_#bebebe,-9px_-9px_16px_#ffffff]">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-700">💎 Multisend Tool</h2>

        {/* Wallet */}
        <div className="mb-6">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full py-3 rounded-2xl text-gray-700 font-semibold shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] transition"
            >
              <Wallet size={20} className="inline mr-2" />
              Connect Wallet
            </button>
          ) : (
            <div className="p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] text-sm text-gray-600">
              <p className="break-all font-mono">{account}</p>
              {currentNetwork && (
                <p className="mt-1">Network: <span className="font-semibold">{currentNetwork.name}</span></p>
              )}
              <button
                onClick={disconnectWallet}
                className="mt-3 bg-red-500 text-white px-3 py-1 rounded-xl shadow hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Send Type */}
        {account && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setSendType("native")}
              className={`flex-1 py-3 rounded-2xl font-semibold transition ${
                sendType === "native"
                  ? "bg-[#e0e0e0] text-gray-700 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]"
                  : "bg-[#e0e0e0] text-gray-500 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]"
              }`}
            >
              Native ({networkSymbol})
            </button>
            <button
              onClick={() => setSendType("token")}
              className={`flex-1 py-3 rounded-2xl font-semibold transition ${
                sendType === "token"
                  ? "bg-[#e0e0e0] text-gray-700 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]"
                  : "bg-[#e0e0e0] text-gray-500 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]"
              }`}
            >
              ERC20 Token
            </button>
          </div>
        )}

        {/* Token Address */}
        {account && sendType === "token" && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Token contract (0x...)"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#e0e0e0] text-gray-700 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] focus:outline-none"
            />
            {tokenInfo && (
              <p className="text-green-600 mt-2 text-sm">
                ✅ {tokenInfo.symbol} (Decimals: {tokenInfo.decimals})
              </p>
            )}
          </div>
        )}

        {/* Balance */}
        {account && (
          <div className="mb-6 p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] text-gray-700 flex justify-between">
            <span>Balance:</span>
            <span className="font-semibold">
              {balance} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
            </span>
          </div>
        )}

        {/* Recipients */}
        {account && (
          <div className="mb-6">
            <textarea
              className="w-full p-4 rounded-2xl bg-[#e0e0e0] text-gray-700 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] font-mono resize-none focus:outline-none"
              placeholder="0xaddress1,0.01&#10;0xaddress2,0.02"
              rows="8"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            ></textarea>
            <div className="flex justify-between text-gray-500 text-sm mt-2">
              <span>Recipients: {parseRecipients().length}</span>
              <span>
                Total: {getTotalAmount()} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 text-red-500 bg-red-100 p-3 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Send Button */}
        {account && (
          <button
            onClick={executeMultisend}
            disabled={loading || parseRecipients().length === 0}
            className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition ${
              loading || parseRecipients().length === 0
                ? "text-gray-400 shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] cursor-not-allowed"
                : "text-gray-700 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]"
            }`}
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={20} /> Send ({parseRecipients().length})
              </>
            )}
          </button>
        )}

        {/* Results */}
        {txResults.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] max-h-80 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle size={18} /> Transaction Results
            </h3>
            {txResults.map((r, i) => (
              <div
                key={i}
                className={`p-3 mb-2 rounded-xl ${
                  r.status === "success"
                    ? "bg-green-100"
                    : r.status === "failed"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                <p className="text-xs font-mono break-all text-gray-700">{r.address}</p>
                <p className="text-sm text-gray-600">
                  Amount: <span className="font-semibold">{r.amount}</span>
                </p>
                {r.hash && (
                  <a
                    href={`${explorer}/tx/${r.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 flex items-center gap-1"
                  >
                    View TX <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultisendTool;
