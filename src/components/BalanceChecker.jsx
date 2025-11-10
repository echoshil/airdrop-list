import React, { useState } from "react";
import { ethers } from "ethers";
import { Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { Alchemy, Network } from "alchemy-sdk";

const NETWORKS = {
  Ethereum: { rpc: "https://eth.llamarpc.com" },
  Polygon: { rpc: "https://polygon-rpc.com" },
  BSC: { rpc: "https://bsc-dataseed.binance.org" },
  Arbitrum: { rpc: "https://arb1.arbitrum.io/rpc" },
  Base: { rpc: "https://mainnet.base.org" },
};

const BalanceChecker = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // State untuk EVM Native & Tokens Balance Checker
  const [evmAddresses, setEvmAddresses] = useState("");
  const [evmBalances, setEvmBalances] = useState([]);
  const [evmBalanceLoading, setEvmBalanceLoading] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState("");
  const [checkType, setCheckType] = useState("native");
  const [tokenContractAddress, setTokenContractAddress] = useState("");

  // State untuk Quick Network Balance Checker
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [quickAddresses, setQuickAddresses] = useState("");
  const [quickBalances, setQuickBalances] = useState([]);
  const [quickBalanceLoading, setQuickBalanceLoading] = useState(false);

  // State untuk Auto Wallet Scanner
  const [scannerAddress, setScannerAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [scannerChain, setScannerChain] = useState("eth-mainnet");

  const checkBalances = async () => {
    const list = quickAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");

    setQuickBalanceLoading(true);
    setQuickBalances([]);
    const result = [];

    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);

      for (const addr of list) {
        try {
          if (!ethers.isAddress(addr)) {
            result.push({
              address: addr,
              balance: "❌ Invalid Address"
            });
            continue;
          }

          const checksumAddr = ethers.getAddress(addr);
          const bal = await provider.getBalance(checksumAddr);
          const formattedBalance = parseFloat(ethers.formatEther(bal)).toFixed(6);

          result.push({
            address: checksumAddr,
            balance: formattedBalance
          });
        } catch (err) {
          console.error(`Error checking ${addr}:`, err);
          result.push({
            address: addr,
            balance: "❌ Error"
          });
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert(`⚠️ Gagal terhubung ke ${selectedNetwork} network. Coba lagi!`);
    } finally {
      setQuickBalances(result);
      setQuickBalanceLoading(false);
    }
  };

  const checkEVMBalances = async () => {
    const list = evmAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");

    if (!customRpcUrl) return alert("Masukkan RPC URL!");

    if (checkType === "token" && !tokenContractAddress) {
      return alert("Masukkan contract address token!");
    }

    setEvmBalanceLoading(true);
    setEvmBalances([]);
    const result = [];

    try {
      const provider = new ethers.JsonRpcProvider(customRpcUrl);

      if (checkType === "native") {
        for (const addr of list) {
          try {
            if (!ethers.isAddress(addr)) {
              result.push({
                address: addr,
                balance: "❌ Invalid Address"
              });
              continue;
            }

            const checksumAddr = ethers.getAddress(addr);
            const bal = await provider.getBalance(checksumAddr);
            const formattedBalance = parseFloat(ethers.formatEther(bal)).toFixed(6);

            result.push({
              address: checksumAddr,
              balance: formattedBalance
            });
          } catch (err) {
            console.error(`Error checking ${addr}:`, err);
            result.push({
              address: addr,
              balance: "❌ Error"
            });
          }
        }
      } else if (checkType === "token") {
        if (!ethers.isAddress(tokenContractAddress)) {
          alert("❌ Invalid token contract address!");
          setEvmBalanceLoading(false);
          return;
        }

        const tokenABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)"
        ];

        try {
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, provider);
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();

          for (const addr of list) {
            try {
              if (!ethers.isAddress(addr)) {
                result.push({
                  address: addr,
                  balance: "❌ Invalid Address",
                  symbol: symbol
                });
                continue;
              }

              const checksumAddr = ethers.getAddress(addr);
              const bal = await tokenContract.balanceOf(checksumAddr);
              const formattedBalance = parseFloat(ethers.formatUnits(bal, decimals)).toFixed(6);

              result.push({
                address: checksumAddr,
                balance: formattedBalance,
                symbol: symbol
              });
            } catch (err) {
              console.error(`Error checking ${addr}:`, err);
              result.push({
                address: addr,
                balance: "❌ Error",
                symbol: symbol
              });
            }
          }
        } catch (err) {
          console.error("Token contract error:", err);
          alert("⚠️ Gagal membaca token contract. Pastikan contract address benar!");
          setEvmBalanceLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert("⚠️ Gagal terhubung ke RPC URL. Pastikan URL benar dan mendukung jaringan EVM!");
    } finally {
      setEvmBalances(result);
      setEvmBalanceLoading(false);
    }
  };

  // Auto Wallet Scanner Functions
  const getAlchemy = () => {
    const settings = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network:
        scannerChain === "eth-mainnet"
          ? Network.ETH_MAINNET
          : scannerChain === "arbitrum"
          ? Network.ARB_MAINNET
          : scannerChain === "polygon"
          ? Network.MATIC_MAINNET
          : scannerChain === "base"
          ? Network.BASE_MAINNET
          : Network.ETH_MAINNET,
    };
    return new Alchemy(settings);
  };

  const fetchTokens = async () => {
    if (!scannerAddress) {
      setScannerError("Masukkan wallet address terlebih dahulu.");
      return;
    }
    setScannerLoading(true);
    setScannerError("");
    setTokens([]);

    try {
      const alchemy = getAlchemy();
      const balances = await alchemy.core.getTokenBalances(scannerAddress);
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
      setScannerError("Gagal memuat data token. Periksa address dan API key kamu.");
    } finally {
      setScannerLoading(false);
    }
  };

  // Neumorphic styles
  const neuContainer = "bg-[#e0e5ec] rounded-3xl shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff] p-6 transition";
  const neuButton = "bg-[#e0e5ec] rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition text-gray-700 font-semibold";

  return (
    <div className="w-full mb-8">
      {/* Header */}
      <div
        className={`${neuContainer} flex justify-between items-center bg-gradient-to-r from-[#e0e5ec] to-[#f1f4f8] cursor-pointer mb-4`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-700">
          <Wallet size={26} className="text-indigo-500" /> 💰 Balance Checker
        </h2>
        <button className={`${neuButton} px-4 py-2 flex items-center gap-2`}>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* EVM Native & Tokens Balance Checker */}
          <div className="p-6 rounded-2xl"
            style={{
              background: '#e0e5ec',
              boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🔷 EVM Native & Tokens Balance Checker
            </h2>

            <div className="space-y-4">
              {/* RPC URL Input */}
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">Input RPC URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://1.rpc.thirdweb.com"
                  value={customRpcUrl}
                  onChange={(e) => setCustomRpcUrl(e.target.value)}
                  className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800"
                  style={{
                    boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                  }}
                />
              </div>

              {/* Check Type Dropdown */}
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">Select Check Type</label>
                <select
                  value={checkType}
                  onChange={(e) => {
                    setCheckType(e.target.value);
                    setEvmBalances([]);
                  }}
                  className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 cursor-pointer font-medium"
                  style={{
                    boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                  }}
                >
                  <option value="native">Check Native Balance</option>
                  <option value="token">Check Token Balance</option>
                </select>
              </div>

              {/* Token Contract Address (only show if checkType is token) */}
              {checkType === "token" ? (
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">Token Contract Address</label>
                  <input
                    type="text"
                    placeholder="0xabc...def"
                    value={tokenContractAddress}
                    onChange={(e) => setTokenContractAddress(e.target.value)}
                    className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800"
                    style={{
                      boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                    }}
                  />
                </div>
              ) : null}

              {/* Wallet Addresses Input */}
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">Wallet Addresses (one per line)</label>
                <textarea
                  className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 resize-none"
                  style={{
                    boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                  }}
                  placeholder="Paste wallet addresses (one per line)&#10;Example:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                  rows="6"
                  value={evmAddresses}
                  onChange={(e) => setEvmAddresses(e.target.value)}
                ></textarea>
              </div>

              {/* Check Balance Button */}
              <button
                onClick={checkEVMBalances}
                disabled={evmBalanceLoading}
                className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
                  evmBalanceLoading
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-700 hover:text-blue-800"
                }`}
                style={{
                  boxShadow: evmBalanceLoading
                    ? 'inset 4px 4px 8px rgba(163,177,198,0.6)'
                    : '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                }}
              >
                {evmBalanceLoading ? "⏳ Checking..." : "Check Balance"}
              </button>
            </div>

            {/* Results Table */}
            {evmBalances.length > 0 && (
              <div className="mt-6 rounded-lg p-4"
                style={{
                  background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-700 font-semibold">
                    Results - {checkType === "native" ? "Native Balance" : "Token Balance"}
                  </h3>
                  <button
                    onClick={() => setEvmBalances([])}
                    className="text-xs text-white px-3 py-1 rounded"
                    style={{
                      background: 'linear-gradient(145deg, #dc2626, #ef4444)',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-blue-700 border-b border-gray-300">
                        <th className="p-2">#</th>
                        <th className="p-2">Address</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evmBalances.map((b, i) => (
                        <tr key={i} className="border-b border-gray-300">
                          <td className="p-2 text-gray-600">{i + 1}</td>
                          <td className="p-2 break-all font-mono text-xs text-gray-700">{b.address}</td>
                          <td className={`p-2 text-right font-semibold ${
                            b.balance.includes('Error') || b.balance.includes('Invalid')
                              ? 'text-red-600'
                              : parseFloat(b.balance) > 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}>
                            {b.balance.includes('Error') || b.balance.includes('Invalid')
                              ? b.balance
                              : checkType === "token"
                              ? `${b.balance} ${b.symbol || 'TOKEN'}`
                              : `${b.balance} Native`
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {checkType === "native" && (
                  <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                    Total Balance: {evmBalances
                      .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                      .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                      .toFixed(6)} Native
                  </div>
                )}
                {checkType === "token" && evmBalances[0]?.symbol && (
                  <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                    Total Balance: {evmBalances
                      .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                      .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                      .toFixed(6)} {evmBalances[0].symbol}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Default Network Balance Checker */}
          <div className="p-6 rounded-2xl"
            style={{
              background: '#e0e5ec',
              boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
              💰 Quick Network Balance Checker
            </h2>

            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {Object.keys(NETWORKS).map((net) => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`px-4 py-2 rounded-lg text-sm md:text-base transition font-medium ${
                    selectedNetwork === net
                      ? "text-blue-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  style={
                    selectedNetwork === net
                      ? {
                          boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)'
                        }
                      : {
                          boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                        }
                  }
                >
                  {net}
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 resize-none"
              style={{
                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
              }}
              placeholder="Paste wallet addresses (one per line)&#10;Example:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
              rows="8"
              value={quickAddresses}
              onChange={(e) => setQuickAddresses(e.target.value)}
            ></textarea>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <button
                onClick={checkBalances}
                disabled={quickBalanceLoading}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition ${
                  quickBalanceLoading
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-green-700 hover:text-green-800"
                }`}
                style={{
                  boxShadow: quickBalanceLoading
                    ? 'inset 4px 4px 8px rgba(163,177,198,0.6)'
                    : '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                }}
              >
                {quickBalanceLoading ? "⏳ Checking..." : "✅ Check Balance"}
              </button>
              {quickBalances.length > 0 && (
                <span className="text-sm text-gray-600 font-medium">
                  Total: {quickBalances.length} address(es) checked
                </span>
              )}
            </div>

            {quickBalances.length > 0 && (
              <div className="mt-6 rounded-lg p-4"
                style={{
                  background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-700 font-semibold">Results - {selectedNetwork}</h3>
                  <button
                    onClick={() => setQuickBalances([])}
                    className="text-xs text-white px-3 py-1 rounded"
                    style={{
                      background: 'linear-gradient(145deg, #dc2626, #ef4444)',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-blue-700 border-b border-gray-300">
                        <th className="p-2">#</th>
                        <th className="p-2">Address</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quickBalances.map((b, i) => (
                        <tr key={i} className="border-b border-gray-300">
                          <td className="p-2 text-gray-600">{i + 1}</td>
                          <td className="p-2 break-all font-mono text-xs text-gray-700">{b.address}</td>
                          <td className={`p-2 text-right font-semibold ${
                            b.balance.includes('Error') || b.balance.includes('Invalid')
                              ? 'text-red-600'
                              : parseFloat(b.balance) > 0
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}>
                            {b.balance.includes('Error') || b.balance.includes('Invalid')
                              ? b.balance
                              : `${b.balance} ${selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}`
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                  Total Balance: {quickBalances
                    .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                    .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                    .toFixed(6)} {selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}
                </div>
              </div>
            )}
          </div>

          {/* Auto Wallet Scanner */}
          <div className="p-6 rounded-2xl"
            style={{
              background: '#e0e5ec',
              boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              🪙 Auto Wallet Scanner
            </h2>

            {/* Chain Selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {["eth-mainnet", "arbitrum", "polygon", "base"].map((c) => (
                <button
                  key={c}
                  onClick={() => setScannerChain(c)}
                  className={`px-4 py-2 rounded-lg text-sm md:text-base transition font-medium ${
                    scannerChain === c
                      ? "text-white bg-gradient-to-r from-orange-400 to-pink-400"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  style={
                    scannerChain === c
                      ? {}
                      : {
                          boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                        }
                  }
                >
                  {c === "eth-mainnet"
                    ? "Ethereum"
                    : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>

            {/* Input Section */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Masukkan wallet address..."
                value={scannerAddress}
                onChange={(e) => setScannerAddress(e.target.value)}
                className="flex-1 bg-[#e0e5ec] text-gray-700 rounded-xl px-4 py-3"
                style={{
                  boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                }}
              />
              <button
                onClick={fetchTokens}
                disabled={scannerLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  scannerLoading
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
                }`}
                style={{
                  boxShadow: scannerLoading
                    ? 'inset 4px 4px 8px rgba(163,177,198,0.6)'
                    : '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                }}
              >
                {scannerLoading ? "⏳ Scanning..." : "🔍 Scan"}
              </button>
            </div>

            {scannerError && (
              <p className="text-red-500 text-sm text-center font-medium mb-4">{scannerError}</p>
            )}

            {/* Token List */}
            {tokens.length > 0 && (
              <div className="rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto"
                style={{
                  background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                  boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-700 font-semibold">
                    Found {tokens.length} Token{tokens.length > 1 ? 's' : ''}
                  </h3>
                  <button
                    onClick={() => setTokens([])}
                    className="text-xs text-white px-3 py-1 rounded"
                    style={{
                      background: 'linear-gradient(145deg, #dc2626, #ef4444)',
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    Clear
                  </button>
                </div>
                {tokens.map((t, i) => (
                  <div
                    key={i}
                    className="bg-[#e0e5ec] flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{
                      boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                    }}
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

            {!scannerLoading && tokens.length === 0 && !scannerError && (
              <div className="text-center text-gray-500 text-sm p-4 rounded-lg"
                style={{
                  background: '#e0e5ec',
                  boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.4), inset -3px -3px 6px rgba(255,255,255,0.5)'
                }}
              >
                Masukkan wallet dan klik <b>Scan</b> untuk melihat token yang dimiliki.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceChecker;

