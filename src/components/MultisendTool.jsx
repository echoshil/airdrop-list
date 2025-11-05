import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Send, AlertCircle, CheckCircle, Loader, ExternalLink } from "lucide-react";

// ERC20 ABI - only transfer function needed
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
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
  const [sendType, setSendType] = useState("native"); // 'native' or 'token'
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [recipients, setRecipients] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [txResults, setTxResults] = useState([]);
  const [error, setError] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("❌ Please install MetaMask or any EVM wallet!");
        return;
      }

      setError("");
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await tempProvider.send("eth_requestAccounts", []);
      const tempSigner = await tempProvider.getSigner();
      const network = await tempProvider.getNetwork();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Listen to account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      // Listen to chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect wallet: " + err.message);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
    setTokenInfo(null);
  };

  // Fetch Balance
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
        console.error("Balance fetch error:", err);
        setBalance("Error");
      }
    };

    fetchBalance();
  }, [account, provider, sendType, tokenAddress]);

  // Fetch Token Info
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
      } catch (err) {
        console.error("Token info error:", err);
        setTokenInfo(null);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, provider, sendType]);

  // Parse Recipients
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

  // Calculate Total Amount
  const getTotalAmount = () => {
    const parsed = parseRecipients();
    return parsed.reduce((sum, item) => sum + item.amount, 0).toFixed(6);
  };

  // Execute Multisend
  const executeMultisend = async () => {
    if (!signer) {
      alert("❌ Please connect your wallet first!");
      return;
    }

    const parsed = parseRecipients();
    if (parsed.length === 0) {
      alert("❌ No valid recipients found! Format: 0xaddress,amount");
      return;
    }

    setLoading(true);
    setTxResults([]);
    setError("");

    const results = [];

    try {
      if (sendType === "native") {
        // Send Native Token
        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await signer.sendTransaction({
              to: address,
              value: ethers.parseEther(amount.toString()),
            });

            results.push({
              address,
              amount,
              status: "pending",
              hash: tx.hash,
            });
            setTxResults([...results]);

            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            console.error(`Error sending to ${address}:`, err);
            results[i] = {
              address,
              amount,
              status: "failed",
              error: err.message,
            };
            setTxResults([...results]);
          }
        }
      } else {
        // Send ERC20 Token
        if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
          alert("❌ Invalid token contract address!");
          setLoading(false);
          return;
        }

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await contract.decimals();

        for (let i = 0; i < parsed.length; i++) {
          const { address, amount } = parsed[i];
          try {
            const tx = await contract.transfer(
              address,
              ethers.parseUnits(amount.toString(), decimals)
            );

            results.push({
              address,
              amount,
              status: "pending",
              hash: tx.hash,
            });
            setTxResults([...results]);

            await tx.wait();
            results[i].status = "success";
            setTxResults([...results]);
          } catch (err) {
            console.error(`Error sending to ${address}:`, err);
            results[i] = {
              address,
              amount,
              status: "failed",
              error: err.message,
            };
            setTxResults([...results]);
          }
        }
      }

      // Refresh balance after all transactions
      const bal = sendType === "native" 
        ? await provider.getBalance(account)
        : await new ethers.Contract(tokenAddress, ERC20_ABI, provider).balanceOf(account);
      
      const decimals = sendType === "native" ? 18 : await new ethers.Contract(tokenAddress, ERC20_ABI, provider).decimals();
      setBalance(ethers.formatUnits(bal, decimals));

    } catch (err) {
      console.error("Multisend error:", err);
      setError("Transaction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentNetwork = chainId ? EVM_NETWORKS[chainId] : null;
  const networkSymbol = currentNetwork?.symbol || "TOKEN";
  const explorer = currentNetwork?.explorer || "";

  return (
    <div className="relative z-10 pb-10 fade-in">
      <div className="bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-700 max-w-5xl mx-auto">
        {/* Wallet Connection */}
        <div className="mb-6 text-center">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              data-testid="connect-wallet-btn"
            >
              <Wallet size={20} />
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Connected</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Disconnect
                </button>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-cyan-400 font-mono text-sm break-all" data-testid="connected-address">
                  {account}
                </p>
                {currentNetwork && (
                  <p className="text-xs text-gray-400 mt-1">
                    Network: <span className="text-cyan-400">{currentNetwork.name}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Send Type Toggle */}
        {account && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Send Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSendType("native")}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  sendType === "native"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                data-testid="send-native-btn"
              >
                Send Native ({networkSymbol})
              </button>
              <button
                onClick={() => setSendType("token")}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  sendType === "token"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
                data-testid="send-token-btn"
              >
                Send Tokens (ERC20)
              </button>
            </div>
          </div>
        )}

        {/* Token Address Input */}
        {account && sendType === "token" && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Token Contract Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white focus:border-cyan-400 focus:outline-none"
              data-testid="token-address-input"
            />
            {tokenInfo && (
              <p className="text-xs text-green-400 mt-2">
                ✅ Token: {tokenInfo.symbol} (Decimals: {tokenInfo.decimals})
              </p>
            )}
          </div>
        )}

        {/* Balance Display */}
        {account && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Balance:</span>
              <span className="text-cyan-400 font-semibold text-lg" data-testid="balance-display">
                {balance} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
              </span>
            </div>
          </div>
        )}

        {/* Recipients Input */}
        {account && (
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">
              Recipients (Format: address,amount - one per line)
            </label>
            <textarea
              className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white resize-none focus:border-cyan-400 focus:outline-none font-mono text-sm"
              placeholder="0xaddress1,0.01&#10;0xaddress2,0.02&#10;0xaddress3,0.03"
              rows="8"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              data-testid="recipients-input"
            ></textarea>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-400">
                Total Recipients: <span className="text-cyan-400">{parseRecipients().length}</span>
              </span>
              <span className="text-gray-400">
                Total Amount:{" "}
                <span className="text-cyan-400">
                  {getTotalAmount()} {sendType === "token" && tokenInfo ? tokenInfo.symbol : networkSymbol}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Send Button */}
        {account && (
          <button
            onClick={executeMultisend}
            disabled={loading || parseRecipients().length === 0}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              loading || parseRecipients().length === 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            data-testid="send-multisend-btn"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send to {parseRecipients().length} Recipients
              </>
            )}
          </button>
        )}

        {/* Transaction Results */}
        {txResults.length > 0 && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={18} />
              Transaction Results
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {txResults.map((result, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    result.status === "success"
                      ? "bg-green-900/20 border-green-700"
                      : result.status === "failed"
                      ? "bg-red-900/20 border-red-700"
                      : "bg-yellow-900/20 border-yellow-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 font-mono break-all">
                        {result.address}
                      </p>
                      <p className="text-sm mt-1">
                        Amount: <span className="text-cyan-400">{result.amount}</span>
                      </p>
                      {result.hash && (
                        <a
                          href={`${explorer}/tx/${result.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                        >
                          View TX <ExternalLink size={12} />
                        </a>
                      )}
                      {result.error && (
                        <p className="text-xs text-red-400 mt-1">{result.error}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        result.status === "success"
                          ? "bg-green-600 text-white"
                          : result.status === "failed"
                          ? "bg-red-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultisendTool;
