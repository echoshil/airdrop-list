import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Trash2, CheckCircle, RefreshCcw, Edit, Bell } from "lucide-react";

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const SHEET_NAME = "airdrop_tracker";
const GOOGLE_APPS_SCRIPT_PROXY = "https://script.google.com/macros/s/AKfycbxguz0fmTSjiZ-HfL078I_2xxyP5bPFglNCPYp9FmLYRVZzCJyXyDMhCkCF9fXGaO2h/exec"; // 🔧 Ganti ini dengan URL Apps Script kamu

function todayStr() {
  return new Date().toDateString();
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const [newProject, setNewProject] = useState("");
  const [selected, setSelected] = useState(null);
  const syncingRef = useRef(false);

  // === 🔹 Load dari Google Sheets (READ) ===
  useEffect(() => {
    if (!SHEET_ID || !API_KEY) return;
    loadFromSheet();
  }, []);

  async function loadFromSheet() {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
      const res = await axios.get(url);
      const values = res.data.values || [];
      const headers = values.shift();
      const rows = values.map((r) =>
        Object.fromEntries(headers.map((h, i) => [h.trim(), r[i] || ""]))
      );
      const mapped = rows.map((r, idx) => ({
        id: Date.now() + idx,
        name: r.name || "",
        done: r.done === "1",
        daily: r.daily === "1" || r.dailyStatus === "1",
        details: {
          twitter: r.twitter || "",
          discord: r.discord || "",
          telegram: r.telegram || "",
          wallet: r.wallet || "",
          email: r.email || "",
          website: r.website || "",
        },
      }));
      setProjects(mapped);
    } catch (err) {
      console.error("Load error", err);
      alert("Gagal load dari Google Sheets. Pastikan Sheet public & API key benar.");
    }
  }

  // === 🔹 Tambah ke Sheet via Apps Script Proxy (WRITE) ===
  async function appendToSheet(project) {
    if (!GOOGLE_APPS_SCRIPT_PROXY) return;
    try {
      await axios.post(GOOGLE_APPS_SCRIPT_PROXY, project);
    } catch (e) {
      console.error("Proxy append error:", e);
    }
  }

  // === 🔹 Theme toggle ===
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // === 🔹 Reminder & reset harian ===
  useEffect(() => {
    const last = localStorage.getItem("last_daily_reset_v3");
    const today = todayStr();
    if (last !== today) {
      setProjects((prev) => prev.map((p) => (p.daily ? { ...p, done: false } : p)));
      localStorage.setItem("last_daily_reset_v3", today);
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
        localStorage.setItem("last_daily_reset_v3", todayStr());
      }
    }, 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // === 🔹 Add Project ===
  async function addProject() {
    if (!newProject.trim()) return;
    const base = {
      id: Date.now(),
      name: newProject.trim(),
      done: false,
      daily: false,
      details: {},
    };
    setProjects((prev) => [...prev, base]);
    setNewProject("");
    await appendToSheet(base);
  }

  // === 🔹 Update project detail ===
  function updateDetails(id, details) {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, details } : p))
    );
    setSelected(null);
  }

  const toggleDone = (id) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  const toggleDaily = (id) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, daily: !p.daily } : p)));
  const clearCompleted = () => setProjects((prev) => prev.filter((p) => !p.done));
  const resetDaily = () =>
    setProjects((prev) => prev.map((p) => (p.daily ? { ...p, done: false } : p)));

  const total = projects.length;
  const doneCount = projects.filter((p) => p.done).length;
  const dailyCount = projects.filter((p) => p.daily).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="text-blue-500" /> Airdrop Tracker Pro v3
          </h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>

        {/* Progress bar */}
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
            className="input col-span-2 border rounded-lg p-2"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={addProject} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Tambah
            </button>
            <button onClick={loadFromSheet} className="bg-amber-600 text-white px-4 py-2 rounded-lg">
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
                  <input type="checkbox" checked={p.done} onChange={() => toggleDone(p.id)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`${p.done ? "line-through text-gray-500" : ""}`}>
                        {p.name}
                      </div>
                      {p.details?.website && (
                        <a
                          href={p.details.website}
                          target="_blank"
                          rel="noreferrer"
                          title="Official Website"
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
                      p.daily ? "bg-yellow-500 text-white" : "bg-gray-200 dark:bg-gray-700"
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
              onClick={() =>
                new Notification("Test Reminder", { body: "Ini adalah tes reminder jam 09:00" })
              }
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Bell size={16} /> Test Reminder
            </button>
            <button onClick={clearCompleted} className="bg-red-600 text-white px-3 py-2 rounded-lg">
              <Trash2 size={16} /> Clear Completed
            </button>
          </div>
        </div>

        {/* Modal Edit */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 space-y-3">
                <h2 className="text-xl font-bold mb-3">Edit Detail - {selected.name}</h2>
                {["twitter", "discord", "telegram", "wallet", "email", "website"].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field}
                    className="w-full border rounded-md p-2 dark:bg-gray-700"
                    value={selected.details?.[field] || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        details: { ...selected.details, [field]: e.target.value },
                      })
                    }
                  />
                ))}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setSelected(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => updateDetails(selected.id, selected.details)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
