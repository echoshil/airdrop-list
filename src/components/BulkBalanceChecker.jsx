import React, { useState } from 'react';
import { ethers } from 'ethers';

const NETWORKS = {
  Ethereum: { rpc: 'https://rpc.ankr.com/eth' },
  Polygon: { rpc: 'https://rpc.ankr.com/polygon' },
  BSC: { rpc: 'https://rpc.ankr.com/bsc' },
  Arbitrum: { rpc: 'https://rpc.ankr.com/arbitrum' },
  Base: { rpc: 'https://rpc.ankr.com/base' },
};

export default function BulkBalanceChecker() {
  const [network, setNetwork] = useState('Ethereum');
  const [addresses, setAddresses] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkBalances = async () => {
    const provider = new ethers.JsonRpcProvider(NETWORKS[network].rpc);
    const addrList = addresses.split(/\s+/).filter(Boolean);
    if (addrList.length === 0) return alert('Masukkan minimal 1 address!');

    setLoading(true);
    const balances = [];
    for (const addr of addrList) {
      try {
        const bal = await provider.getBalance(addr);
        balances.push({
          address: addr,
          balance: ethers.formatEther(bal),
        });
      } catch (e) {
        balances.push({ address: addr, balance: '❌ Error' });
      }
    }
    setResults(balances);
    setLoading(false);
  };

  return (
    <div className="bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-700">
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {Object.keys(NETWORKS).map((net) => (
          <button key={net} onClick={() => setNetwork(net)} className={`px-4 py-2 rounded-lg ${network === net ? 'bg-cyan-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
            {net}
          </button>
        ))}
      </div>

      <textarea
        className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white resize-none"
        placeholder="Tempelkan wallet address (satu baris satu address)..."
        rows="6"
        value={addresses}
        onChange={(e) => setAddresses(e.target.value)}
      ></textarea>

      <button onClick={checkBalances} disabled={loading} className="mt-4 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold">
        {loading ? 'Checking...' : 'Cek Saldo'}
      </button>

      {results.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-cyan-400 border-b border-gray-700">
                <th className="p-2">Address</th>
                <th className="p-2">Balance (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2 break-all">{r.address}</td>
                  <td className="p-2">{r.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
