import React, { useState } from "react";
import { Wallet, Network, Loader2 } from "lucide-react";
import { checkBalances, NETWORKS } from "./checkBalances"; // import fungsi kamu

const BalanceChecker = () => {
  const [addresses, setAddresses] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [balances, setBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const neuContainer =
    "bg-[#e0e5ec] rounded-3xl shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff] p-8 space-y-6";
  const neuInput =
    "bg-[#e0e5ec] text-gray-700 rounded-xl w-full p-4 shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] outline-none focus:ring-2 focus:ring-blue-400 transition";
  const neuButton =
    "bg-[#e0e5ec] rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-gray-700 font-semibold px-6 py-3 transition";
  const neuCard =
    "bg-[#e0e5ec] rounded-2xl p-4 shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-gray-700";

  const handleCheck = () =>
    checkBalances(addresses, selectedNetwork, setBalanceLoading, setBalances);

  return (
    <div className="w-full flex justify-center py-10">
      <div className={`${neuContainer} w-full max-w-3xl`}>
        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2 mb-2">
          <Wallet className="text-blue-500" size={28} /> Neumorphic Balance Checker
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan beberapa address wallet untuk memeriksa saldo di jaringan yang kamu pilih.
        </p>

        {/* Input Section */}
        <div>
          <label className="text-sm text-gray-600 block mb-2">🧾 Daftar Alamat Wallet</label>
          <textarea
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
            placeholder="0x123..., 0xabc..., dst (pisahkan dengan spasi, koma, atau baris baru)"
            className={`${neuInput} h-32 resize-none`}
          ></textarea>
        </div>

        {/* Network Selector */}
        <div>
          <label className="text-sm text-gray-600 block mb-2">🌐 Pilih Network</label>
          <div className="flex flex-wrap gap-3">
            {Object.keys(NETWORKS).map((net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`${neuButton} ${
                  selectedNetwork === net
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white"
                    : "text-gray-700"
                }`}
              >
                <Network size={18} className="inline mr-2" />
                {net}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCheck}
            disabled={balanceLoading}
            className={`${neuButton} mt-4 px-8 py-3 text-lg ${
              balanceLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {balanceLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Checking...
              </span>
            ) : (
              "🔍 Check Balances"
            )}
          </button>
        </div>

        {/* Results */}
        {balances.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-600 flex items-center gap-2">
              💰 Hasil Pengecekan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {balances.map((item, i) => (
                <div key={i} className={`${neuCard}`}>
                  <p className="text-sm break-all font-mono text-gray-600 mb-2">
                    {item.address}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {item.balance} {item.symbol}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {balances.length === 0 && !balanceLoading && (
          <div className="text-center text-gray-500 italic">
            Belum ada hasil. Silakan masukkan alamat dan tekan “Check Balances”.
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceChecker;
