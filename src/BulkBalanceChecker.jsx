import React, { useState } from "react";
import { ethers } from "ethers";

/*
BulkBalanceChecker
- Paste multiline addresses (1 per baris) OR coma/space separated
- Pilih network(s)
- Klik "Check Balances"
- Menampilkan tabel: address + balances per network (in native token & human readable)
*/

// Public RPC endpoints (fallback). For production, replace with your provider keys.
const NETWORKS = {
  ethereum: { name: "Ethereum", symbol: "ETH", rpc: "https://rpc.ankr.com/eth" },
  polygon: { name: "Polygon", symbol: "MATIC", rpc: "https://rpc.ankr.com/polygon" },
  bsc: { name: "BNB Smart Chain", symbol: "BNB", rpc: "https://rpc.ankr.com/bsc" },
  arbitrum: { name: "Arbitrum", symbol: "ARB", rpc: "https://rpc.ankr.com/arbitrum" },
  optimism: { name: "Optimism", symbol: "OP", rpc: "https://rpc.ankr.com/optimism" },
  // tambahkan network lain di sini jika perlu
};

function normalizeInput(text) {
  // split by newline, comma, whitespace, semicolon
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function shortAddr(addr) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function BulkBalanceChecker() {
  const [raw, setRaw] = useState("");
  const [selected, setSelected] = useState({
    ethereum: true,
    polygon: false,
    bsc: false,
    arbitrum: false,
    optimism: false,
  });
  const [results, setResults] = useState([]); // [{address, balances: {ethereum: {wei, formatted}}, error }]
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");

  const toggleNetwork = (k) => {
    setSelected((s) => ({ ...s, [k]: !s[k] }));
  };

  const validateAddresses = (list) => {
    const bad = list.filter((a) => !ethers.utils.isAddress(a));
    return bad;
  };

  const handleCheck = async () => {
    setErrors("");
    const rawList = normalizeInput(raw);
    if (rawList.length === 0) {
      setErrors("Masukkan minimal 1 address.");
      return;
    }

    // Validate count to avoid accidental huge requests
    if (rawList.length > 200) {
      if (!window.confirm(`Kamu memasukkan ${rawList.length} address. Lanjutkan? (Rate limit mungkin terjadi)`)) {
        return;
      }
    }

    const bad = validateAddresses(rawList);
    if (bad.length) {
      setErrors(`Format address salah: ${bad.slice(0, 5).join(", ")}${bad.length > 5 ? "..." : ""}`);
      return;
    }

    const nets = Object.keys(selected).filter((k) => selected[k]);
    if (!nets.length) {
      setErrors("Pilih minimal 1 network.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // create providers for selected networks
      const providers = {};
      for (const n of nets) {
        providers[n] = new ethers.providers.JsonRpcProvider(NETWORKS[n].rpc);
      }

      // For each address, fetch balances for each network in parallel
      const tasks = rawList.map(async (addr) => {
        const balances = {};
        for (const n of nets) {
          try {
            const wei = await providers[n].getBalance(addr);
            balances[n] = {
              wei: wei.toString(),
              formatted: parseFloat(ethers.utils.formatEther(wei)), // number
              symbol: NETWORKS[n].symbol,
            };
          } catch (err) {
            balances[n] = { error: (err && err.message) || "RPC error" };
          }
        }
        return { address: addr, balances };
      });

      const res = await Promise.all(tasks);
      setResults(res);
    } catch (err) {
      console.error(err);
      setErrors("Terjadi kesalahan saat fetching. Cek koneksi / RPC keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const txt = ev.target.result;
      // CSV: ambil kolom pertama setiap baris
      const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      // jika ada koma, ambil kolom pertama
      const addrs = lines.map((l) => l.split(",")[0].trim()).join("\n");
      setRaw((r) => (r ? r + "\n" + addrs : addrs));
    };
    reader.readAsText(f);
  };

  const handleCopyResultCSV = () => {
    if (!results.length) return;
    // CSV header
    const nets = Object.keys(selected).filter((k) => selected[k]);
    const header = ["address", ...nets.map((n) => `${NETWORKS[n].name} (${NETWORKS[n].symbol})`)];
    const lines = [header.join(",")];
    for (const r of results) {
      const row = [r.address, ...nets.map((n) => (r.balances[n]?.formatted != null ? r.balances[n].formatted : r.balances[n]?.error || ""))];
      lines.push(row.join(","));
    }
    const csv = lines.join("\n");
    navigator.clipboard?.writeText(csv).then(() => alert("Hasil CSV disalin ke clipboard"));
  };

  return (
    <div className="bulk-balance-checker p-4 max-w-5xl mx-auto text-sm">
      <h2 className="text-xl font-semibold mb-3">Bulk Wallet Balance Checker</h2>

      <div className="controls mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="block mb-1 font-medium">Paste addresses (1 per line / comma separated)</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-sm"
            placeholder="0xabc..., 0xdef... atau tiap baris satu address"
          />
          <div className="mt-2 flex gap-2 items-center">
            <input id="csv" type="file" accept=".csv,.txt" onChange={handleCSVUpload} />
            <button onClick={() => setRaw("")} className="px-3 py-1 bg-gray-800 rounded">Clear</button>
          </div>
          {errors && <div className="text-red-400 mt-2">{errors}</div>}
        </div>

        <div>
          <label className="block mb-2 font-medium">Networks</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(NETWORKS).map((k) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={selected[k]} onChange={() => toggleNetwork(k)} />
                <span>{NETWORKS[k].name} ({NETWORKS[k].symbol})</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleCheck} disabled={loading} className="px-4 py-2 bg-cyan-600 rounded text-black font-semibold">
              {loading ? "Checking…" : "Check Balances"}
            </button>
            <button onClick={handleCopyResultCSV} disabled={!results.length} className="px-3 py-2 bg-gray-800 rounded">
              Copy CSV
            </button>
            <button onClick={() => { setResults([]); setRaw(""); }} className="px-3 py-2 bg-gray-700 rounded">Reset</button>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            Note: menggunakan public RPC. Untuk akurasi & rate limit lebih baik pakai provider key (Alchemy, Infura, Ankr).
          </div>
        </div>
      </div>

      <div className="results mt-4">
        {results.length === 0 ? (
          <div className="text-gray-400">Belum ada hasil. Klik "Check Balances" untuk memulai.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium">Address</th>
                  {Object.keys(selected).filter((k) => selected[k]).map((k) => (
                    <th key={k} className="text-left p-2 font-medium">{NETWORKS[k].name} ({NETWORKS[k].symbol})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.address} className="border-t border-gray-800">
                    <td className="p-2 align-top">{shortAddr(r.address)} <div className="text-xs text-gray-400">{r.address}</div></td>
                    {Object.keys(selected).filter((k) => selected[k]).map((k) => {
                      const b = r.balances[k];
                      return (
                        <td key={k} className="p-2 align-top">
                          {b ? (b.error ? <span className="text-red-400">{b.error}</span> : (
                            <>
                              <div className="font-semibold">{Number(b.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 })} {b.symbol}</div>
                              <div className="text-xs text-gray-400">({b.wei} wei)</div>
                            </>
                          )) : <span className="text-gray-500">-</span>}
                        </td>
                      );
                    })}
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
