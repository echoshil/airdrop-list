import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Trash2, CheckCircle, RefreshCcw, Edit, Bell } from "lucide-react";

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const SHEET_NAME = "airdrop_tracker";

function todayStr() {
  return new Date().toDateString();
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const [newProject, setNewProject] = useState("");
  const [selected, setSelected] = useState(null);
  const [autoSync, setAutoSync] = useState(() => import.meta.env.VITE_AUTO_SYNC === "true");
  const syncingRef = useRef(false);

  // === 🔹 load initial data dari Google Sheets ===
  useEffect(() => {
    if (!SHEET_ID || !API_KEY) return;
    loadFromSheet();
  }, []);

  // === 🔹 mode gelap / terang ===
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // === 🔹 Reminder + Reset harian ===
  useEffect(() => {
    const last = localStorage.getItem("last_daily_reset_v2");
    const today = todayStr();
    if (last !== today) {
      setProjects((prev) => prev.map((p) => (p.daily ? { ...p, done: false } : p)));
      localStorage.setItem("last_daily_reset_v2", today);
    }
  }, []);
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        if (Notification.permission === "granted")
          new Notification("🚀 Waktunya Garap Airdrop!", {
            body: "Jangan lupa kerjakan daily tasks hari ini.",
          });
        setProjects((prev) => prev.map((p) => (p.daily ? { ...p, done: false } : p)));
        localStorage.setItem("last_daily_reset_v2", todayStr());
      }
    }, 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // === 🔹 Auto load & save ke Google Sheets ===
  async function loadFromSheet() {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
      const res = await axios.get(url);
      const values = res.data.values || [];
      const headers = values.shift();
      const rows = values.map((r) =>
        Object.fromEntries(headers.map((h, i) => [h, r[i] || ""]))
      );
      const mapped = rows.map((r, idx) => ({
        id: Date.now() + idx,
        name: r.name || "",
        done: r.done === "1",
        daily: r.daily === "1",
        details: {
          twitter: r.twitter || "",
          discord: r.discord || "",
          telegram: r.telegram || "",
          wallet: r.wallet || "",
          email: r.email || "",
          website: r.website || "",
          note: r.note || "",
        },
      }));
      setProjects(mapped);
    } catch (err) {
      console.error("Load error", err);
      alert("Gagal load dari Google Sheets. Pastikan Sheet public & API key benar.");
    }
  }

  async function appendToSheet(project) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
      const body = {
        values: [
          [
            project.name,
            project.details.twitter || "",
            project.details.discord || "",
            project.details.telegram || "",
            project.details.wallet || "",
            project.details.email || "",
            project.details.website || "",
            project.daily ? "1" : "0",
            project.done ? "1" : "0",
            project.details.note || "",
            new Date().toISOString(),
          ],
        ],
      };
      await axios.post(url, body);
    } catch (e) {
      console.error("Append error:", e);
    }
  }

  // === 🔹 Tambah project baru ===
  async function addProject() {
    if (!newProject.trim()) return;
    const name = newProject.trim();
    const base = {
      id: Date.now(),
      name,
      done: false,
      daily: false,
      details: {},
      lastUpdated: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, base]);
    setNewProject("");
    if (autoSync) appendToSheet(base);
  }

  // === 🔹 Update ke Sheets ketika diubah ===
  useEffect(() => {
    if (autoSync && projects.length && !syncingRef.current) {
      syncingRef.current = true;
      const t = setTimeout(async () => {
        await syncToSheet();
        syncingRef.current = false;
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [projects]);

  async function syncToSheet() {
    if (!SHEET_ID || !API_KEY) return;
    const header = [
      "name",
      "twitter",
      "discord",
      "telegram",
      "wallet",
      "email",
      "website",
      "daily",
      "done",
      "note",
      "lastUpdated",
    ];
    const rows = projects.map((p) => [
      p.name,
      p.details.twitter || "",
      p.details.discord || "",
      p.details.telegram || "",
      p.details.wallet || "",
      p.details.email || "",
      p.details.website || "",
      p.daily ? "1" : "0",
      p.done ? "1" : "0",
      p.details.note || "",
      p.lastUpdated || "",
    ]);
    const body = { values: [header, ...rows] };
    const range = `${SHEET_NAME}!A1:K${rows.length + 1}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      range
    )}?valueInputOption=RAW&key=${API_KEY}`;
    await axios.put(url, body);
  }

  // === 🔹 Helpers ===
  const toggleDone = (id) =>
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, done: !p.done, lastUpdated: new Date().toISOString() } : p
      )
    );
  const toggleDaily = (id) =>
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, daily: !p.daily, lastUpdated: new Date().toISOString() } : p
      )
    );
  const clearCompleted = () => setProjects((prev) => prev.filter((p) => !p.done));
  const resetDaily = () => {
    setProjects((prev) => prev.map((p) => (p.daily ? { ...p, done: false } : p)));
    localStorage.setItem("last_daily_reset_v2", todayStr());
  };
  const updateDetails = (id, details) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, details, lastUpdated: new Date().toISOString() } : p
      )
    );
    setSelected(null);
  };

  // === 🔹 UI ===
  const total = projects.length;
  const doneCount = projects.filter((p) => p.done).length;
  const dailyCount = projects.filter((p) => p.daily).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="text-blue-500" /> Airdrop Tracker Pro
          </h1>
          <div className="flex items-center gap-3">
            <label className="text-xs mr-1">Auto-sync</label>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            <button
              onClick={() => {
                if (theme === "light") setTheme("dark");
                else setTheme("light");
              }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-sm mt-1">
            ✅ {doneCount}/{total} selesai — 🕒 {dailyCount} daily
          </div>
        </div>

        {/* Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Tambah project..."
            className="input col-span-2"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={addProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Tambah
            </button>
            <button
              onClick={syncToSheet}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg"
            >
              Sync
            </button>
            <button
              onClick={loadFromSheet}
              className="bg-amber-600 text-white px-3 py-2 rounded-lg"
            >
              Load
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          <AnimatePresence>
            {projects.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.12 }}
                className={`flex justify-between items-center p-3 rounded-lg border ${
                  p.done
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={p.done}
                    onChange={() => toggleDone(p.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`${p.done ? "line-through text-gray-500" : ""}`}
                      >
                        {p.name}
                      </div>
                      {p.details?.website && (
                        <a
                          className="external-link"
                          href={p.details.website}
                          target="_blank"
                          rel="noreferrer"
                          title="Open official website"
                        >
                          🌐
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => toggleDaily(p.id)}
                    className={`text-xs px-2 py-1 rounded-md ${
                      p.daily
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {p.daily ? "Daily" : "Set Daily"}
                  </button>
                  <button
                    onClick={() => setSelected(p)}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <Edit size={14} /> Detail
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4">
          <button
            onClick={resetDaily}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg"
          >
            <RefreshCcw size={16} /> Reset Daily
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (Notification.permission === "granted")
                  new Notification("Test Reminder", "Ini adalah tes reminder jam 09:00");
              }}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Bell size={16} /> Test Reminder
            </button>
            <button
              onClick={clearCompleted}
              className="bg-red-600 text-white px-3 py-2 rounded-lg"
            >
              <Trash2 size={16} /> Clear Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
