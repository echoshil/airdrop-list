import React, { useEffect, useState } from "react";
import "./App.css";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL; // must be set

// small helper: fetch with timeout
async function fetchWithTimeout(url, opts = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    website: "",
  });

  // debug helper
  const showError = (title, detail) => {
    console.error(title, detail);
    alert(`${title}\n\n${detail}`);
  };

  // fetch GET
  const fetchProjects = async () => {
    if (!GOOGLE_SCRIPT_URL) {
      showError("ENV ERROR", "VITE_GOOGLE_SCRIPT_URL belum diset. Cek .env di repo / Vercel env.");
      return;
    }
    setLoading(true);
    try {
      console.log("GET ->", GOOGLE_SCRIPT_URL);
      const res = await fetchWithTimeout(GOOGLE_SCRIPT_URL + "?action=read", { method: "GET" }, 10000);
      console.log("GET status:", res.status, res.statusText, res.headers.get("content-type"));
      const text = await res.text();
      console.log("GET body:", text.slice(0, 2000));
      // try parse JSON
      let data = [];
      try { data = JSON.parse(text); } catch (e) {
        throw new Error("Response dari script bukan JSON atau JSON invalid.");
      }
      if (!Array.isArray(data)) throw new Error("Response JSON bukan array.");
      setProjects(data);
      console.log("Projects loaded:", data.length);
    } catch (err) {
      if (err.name === "AbortError") {
        showError("TIMEOUT", "Request GET ke Google Script timed out.");
      } else {
        showError("Gagal load data dari Google Script", err.message || err);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  // add (POST)
  const addProject = async () => {
    if (!form.name.trim()) { alert("Nama project wajib diisi"); return; }
    if (!GOOGLE_SCRIPT_URL) { showError("ENV ERROR", "VITE_GOOGLE_SCRIPT_URL belum diset."); return; }

    const payload = { ...form, action: "add" };
    setLoading(true);
    try {
      console.log("POST ->", GOOGLE_SCRIPT_URL, payload);
      const res = await fetchWithTimeout(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, 10000);

      console.log("POST status:", res.status, res.statusText, res.headers.get("content-type"));
      const text = await res.text();
      console.log("POST body:", text);

      // parse JSON preferably
      let json = null;
      try { json = JSON.parse(text); } catch (e) { /* not JSON */ }

      if (json && (json.status === "OK" || json.status === "ok")) {
        alert("✅ Project berhasil ditambahkan");
        setForm({ name: "", twitter: "", discord: "", telegram: "", wallet: "", email: "", website: "" });
        fetchProjects();
        return;
      }

      // fallback: if response text contains OK
      if (typeof text === "string" && text.toLowerCase().includes("ok")) {
        alert("✅ Project berhasil (respon OK)");
        setForm({ name: "", twitter: "", discord: "", telegram: "", wallet: "", email: "", website: "" });
        fetchProjects();
        return;
      }

      // otherwise fail with details
      throw new Error("Respon dari Apps Script tidak mengindikasikan success. Lihat console untuk body.");
    } catch (err) {
      if (err.name === "AbortError") {
        showError("TIMEOUT", "Request POST ke Google Script timed out.");
      } else if (err.message && err.message.includes("Failed to fetch")) {
        showError("Network error", "Fetch gagal. Mungkin CORS, network, atau URL tidak benar.");
      } else {
        showError("Gagal kirim ke Google Script!", err.message || err);
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20, color: "#eaeaea", background: "#0b0b0b", minHeight: "100vh" }}>
      <h1>Airdrop Tracker — Debug Mode</h1>
      <div style={{ margin: "16px 0" }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="Twitter" value={form.twitter} onChange={e => setForm({...form, twitter: e.target.value})} />
        <button onClick={addProject} disabled={loading}>Add Project</button>
        <button onClick={fetchProjects} disabled={loading}>Refresh</button>
      </div>

      <div>
        <div>ENV URL: <code style={{ color: "#8be9fd" }}>{GOOGLE_SCRIPT_URL || "(not set)"}</code></div>
        <div>Loading: {loading ? "yes" : "no"}</div>
        <h3>Projects ({projects.length})</h3>
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 10 }}>{JSON.stringify(projects, null, 2)}</pre>
      </div>
    </div>
  );
}
