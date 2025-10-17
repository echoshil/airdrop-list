import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const [theme, setTheme] = useState("dark");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Load projects from Google Sheets
  const loadProjects = async () => {
    try {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      const range = "airdrop_tracker!A2:G1000";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      const res = await axios.get(url);

      const data = res.data.values || [];
      const loaded = data.map((row) => ({
        name: row[0],
        twitter: row[1],
        discord: row[2],
        telegram: row[3],
        wallet: row[4],
        email: row[5],
        website: row[6],
        daily: row[7] === "1",
        done: row[8] === "1",
      }));

      setProjects(loaded);
    } catch (err) {
      console.error("Gagal load dari Google Sheets:", err);
      alert("Gagal load dari Google Sheets. Pastikan Sheet public & API key benar.");
    }
  };

  // Add new project (save to Sheets via proxy)
  const addProject = async () => {
    if (!newProject.trim()) return alert("Masukkan nama project dulu!");

    const newItem = {
      name: newProject,
      twitter: "",
      discord: "",
      telegram: "",
      wallet: "",
      email: "",
      website: "",
      daily: false,
      done: false,
    };

    setProjects([...projects, newItem]);
    setNewProject("");

    try {
      const res = await axios.post("/api/sheets-proxy", newItem);
      console.log("Proxy result:", res.data);
    } catch (err) {
      console.error("Proxy append error:", err);
    }
  };

  // Toggle theme (dark/light)
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Calculate progress
  useEffect(() => {
    const doneCount = projects.filter((p) => p.done).length;
    setProgress({ done: doneCount, total: projects.length });
  }, [projects]);

  // Load projects on start
  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} transition`}>
      <header className="flex justify-between items-center p-4 border-b border-gray-600">
        <h1 className="text-2xl font-bold">💰 Airdrop Tracker</h1>
        <button onClick={toggleTheme} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="Tambah project baru..."
            className="border rounded p-2 flex-1 bg-transparent"
          />
          <button onClick={addProject} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded">
            Tambah
          </button>
          <button onClick={loadProjects} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded">
            Sync
          </button>
        </div>

        <div className="mb-3">
          <p>
            Progress: {progress.done}/{progress.total} selesai
          </p>
          <div className="h-2 bg-gray-400 rounded mt-1">
            <div
              className="h-2 bg-green-500 rounded"
              style={{ width: `${(progress.done / (progress.total || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <ul className="space-y-3">
          {projects.map((p, i) => (
            <li
              key={i}
              className="p-3 rounded border border-gray-500 flex justify-between items-center hover:bg-gray-800"
            >
              <div>
                <a
                  href={p.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold hover:underline"
                >
                  {p.name}
                </a>
                <p className="text-sm opacity-75">
                  {p.twitter && <span>🐦 {p.twitter} </span>}
                  {p.discord && <span>💬 {p.discord} </span>}
                  {p.telegram && <span>📱 {p.telegram} </span>}
                </p>
              </div>
              <input
                type="checkbox"
                checked={p.done}
                onChange={() =>
                  setProjects(
                    projects.map((proj, idx) => (idx === i ? { ...proj, done: !proj.done } : proj))
                  )
                }
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
