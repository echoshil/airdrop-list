import React, { useState } from 'react';
import { ethers } from 'ethers';

const NETWORKS = {
  Ethereum: "https://rpc.ankr.com/eth",
  Polygon: "https://rpc.ankr.com/polygon",
  BSC: "https://rpc.ankr.com/bsc",
  Arbitrum: "https://rpc.ankr.com/arbitrum",
  Base: "https://rpc.ankr.com/base",
};

async function testRpc(url) {
  try {
    // test simple JSON-RPC call untuk cek CORS / koneksi
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    if (j.error) throw new Error("RPC error: " + JSON.stringify(j.error));
    console.log("RPC OK:", url, j);
    return true;
  } catch (err) {
    console.error("RPC test failed:", url, err);
    return false;
  }
}

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const checkBalances = async (addressesText, selectedNetwork = "Ethereum") => {
  const list = addressesText
    .split("\n")
    .map((a) => a.trim())
    .filter(Boolean);

  if (list.length === 0) {
    alert("Masukkan minimal satu address!");
    return;
  }

  // validasi addresses
  const invalid = list.filter((a) => !ethers.isAddress(a));
  if (invalid.length) {
    alert("Ada address tidak valid:\n" + invalid.join("\n"));
    return;
  }

  const rpcUrl = NETWORKS[selectedNetwork];
  if (!rpcUrl) {
    alert("RPC untuk network ini tidak ditemukan: " + selectedNetwork);
    return;
  }

  setBalanceLoading(true);
  setBalances([]);

  // test koneksi RPC terlebih dahulu (lihat console jika gagal)
  const ok = await testRpc(rpcUrl);
  if (!ok) {
    alert("Koneksi RPC gagal — cek console untuk detail. Coba ganti network atau RPC URL.");
    setBalanceLoading(false);
    return;
  }

  // buat provider (ethers v6)
  let provider;
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    console.error("Gagal buat provider:", err);
    alert("Gagal buat provider ethers. Lihat console.");
    setBalanceLoading(false);
    return;
  }

  // chunking: 10 address per batch (sesuaikan jika masih kena rate-limit)
  const batches = chunk(list, 10);
  const results = [];

  for (const b of batches) {
    // jalankan parallel untuk satu batch
    const settled = await Promise.allSettled(
      b.map(async (addr) => {
        try {
          const balanceBN = await provider.getBalance(addr);
          const bal = ethers.formatEther(balanceBN);
          return { address: addr, balance: bal };
        } catch (err) {
          console.error("Error getBalance", addr, err);
          return { address: addr, balance: "Error" };
        }
      })
    );

    // ambil hasil
    settled.forEach((s) => {
      if (s.status === "fulfilled") results.push(s.value);
      else results.push({ address: "unknown", balance: "Error" });
    });

    // jeda kecil antar batch untuk mengurangi kemungkinan rate-limit (200-500ms)
    await new Promise((r) => setTimeout(r, 300));
  }

  setBalances(results);
  setBalanceLoading(false);
};
