import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Trash2, CheckCircle, RefreshCcw, Edit, Bell } from "lucide-react";
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const SHEET_NAME = "airdrop_tracker";
function todayStr(){ return new Date().toDateString(); }
export default function App(){
  const [projects, setProjects] = useState(()=>{
    const s = localStorage.getItem("airdrop_projects_v2");
    return s ? JSON.parse(s) : [];
  });
  const [theme, setTheme] = useState(()=> localStorage.getItem("theme") || "system");
  const [newProject, setNewProject] = useState("");
  const [selected, setSelected] = useState(null);
  const [autoSync, setAutoSync] = useState(()=> (import.meta.env.VITE_AUTO_SYNC === "true"));
  const syncingRef = useRef(false);
  useEffect(()=>{
    const root = document.documentElement;
    if(theme==="dark") root.classList.add("dark");
    else if(theme==="light") root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  },[theme]);
  useEffect(()=> localStorage.setItem("airdrop_projects_v2", JSON.stringify(projects)), [projects]);
  useEffect(()=>{
    const last = localStorage.getItem("last_daily_reset_v2");
    const today = todayStr();
    if(last !== today){
      setProjects(prev => prev.map(p => p.daily ? {...p, done:false} : p));
      localStorage.setItem("last_daily_reset_v2", today);
    }
  },[]);
  useEffect(()=>{
    if("Notification" in window && Notification.permission !== "granted"){
      Notification.requestPermission().catch(()=>{});
    }
  },[]);
  useEffect(()=>{
    const iv = setInterval(()=>{
      const now = new Date();
      if(now.getHours()===9 && now.getMinutes()===0){
        if(Notification.permission==="granted") new Notification("🚀 Waktunya Garap Airdrop!", { body:"Jangan lupa kerjakan daily tasks hari ini." });
        setProjects(prev => prev.map(p => p.daily ? {...p, done:false} : p));
        localStorage.setItem("last_daily_reset_v2", todayStr());
      }
    }, 60*1000);
    return ()=> clearInterval(iv);
  },[]);
  function buildSheetValues(arr){
    const header = ["name","twitter","discord","telegram","wallet","email","website","daily","done","note","lastUpdated"];
    const rows = [header];
    arr.forEach(p=>{
      const d = p.details || {};
      rows.push([p.name || "", d.twitter||"", d.discord||"", d.telegram||"", d.wallet||"", d.email||"", d.website||"", p.daily? "1":"0", p.done? "1":"0", d.note||"", p.lastUpdated || ""]);
    });
    return rows;
  }
  async function syncToSheet(){
    if(!SHEET_ID || !API_KEY) return alert("Google Sheet ID or API key not configured (.env).");
    if(syncingRef.current) return;
    syncingRef.current = true;
    try{
      const values = buildSheetValues(projects);
      const range = `${SHEET_NAME}!A1:K${values.length}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW&key=${API_KEY}`;
      await axios.put(url, { values });
      alert("Sync to Google Sheets sukses.");
    }catch(err){
      console.error(err);
      alert("Sync gagal. Cek console dan API key / sheet permissions.");
    }finally{ syncingRef.current = false; }
  }
  async function loadFromSheet(){
    if(!SHEET_ID || !API_KEY) return alert("Google Sheet ID or API key not configured (.env).");
    try{
      const range = `${SHEET_NAME}!A2:K`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
      const res = await axios.get(url);
      const rows = res.data.values || [];
      const loaded = rows.map((r, idx)=>({
        id: Date.now() + idx,
        name: r[0] || "",
        done: (r[8]==="1"),
        daily: (r[7]==="1"),
        lastUpdated: r[10] || "",
        details: {
          twitter: r[1]||"", discord: r[2]||"", telegram: r[3]||"", wallet: r[4]||"", email: r[5]||"", website: r[6]||"", note: r[9]||""
        }
      }));
      setProjects(loaded);
      alert("Load dari Google Sheets selesai.");
    }catch(err){
      console.error(err);
      alert("Load gagal. Cek akses API / sheet permissions.");
    }
  }
  async function autoFetchInfo(name){
    const result = {};
    try{
      const s = await axios.get(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(name)}`);
      const coin = s.data?.coins?.[0];
      if(coin){
        result.website = `https://www.coingecko.com/en/coins/${coin.id}`;
        try{
          const info = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
          if(info.data?.links?.homepage?.[0]) result.website = info.data.links.homepage[0];
          if(info.data?.links?.twitter_screen_name) result.twitter = `https://twitter.com/${info.data.links.twitter_screen_name}`;
        }catch(e){}
      }else{
        const ddg = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(name + " official site")}&format=json`);
        if(ddg.data?.AbstractURL) result.website = ddg.data.AbstractURL;
      }
    }catch(e){
      console.error("autoFetch error", e);
    }
    return result;
  }
  async function addProject(){
    if(!newProject.trim()) return;
    const name = newProject.trim();
    const base = { id: Date.now(), name, done:false, daily:false, details:{}, lastUpdated: new Date().toISOString() };
    const info = await autoFetchInfo(name);
    if(info.website) base.details.website = info.website;
    if(info.twitter) base.details.twitter = info.twitter;
    setProjects(prev=>[...prev, base]);
    setNewProject("");
  }
  const toggleDone = id => setProjects(prev=>prev.map(p=>p.id===id?{...p, done:!p.done, lastUpdated:new Date().toISOString()}:p));
  const toggleDaily = id => setProjects(prev=>prev.map(p=>p.id===id?{...p, daily:!p.daily, lastUpdated:new Date().toISOString()}:p));
  const clearCompleted = () => setProjects(prev=>prev.filter(p=>!p.done));
  const resetDaily = ()=>{ setProjects(prev=>prev.map(p=>p.daily?{...p, done:false}:p)); localStorage.setItem("last_daily_reset_v2", todayStr()); }
  const updateDetails = (id, details) => { setProjects(prev=>prev.map(p=>p.id===id?{...p, details, lastUpdated:new Date().toISOString()}:p)); setSelected(null); };
  const total = projects.length;
  const doneCount = projects.filter(p=>p.done).length;
  const dailyCount = projects.filter(p=>p.daily).length;
  const percent = total ? Math.round((doneCount/total)*100) : 0;
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2"><CheckCircle className="text-blue-500"/> Airdrop Tracker Pro</h1>
          <div className="flex items-center gap-3">
            <label className="text-xs mr-1">Auto-sync</label>
            <input type="checkbox" checked={autoSync} onChange={(e)=>setAutoSync(e.target.checked)} />
            <button onClick={()=>{ if(theme==='light') setTheme('dark'); else setTheme('light'); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {theme==='dark' ? <Sun/> : <Moon/>}
            </button>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{percent}%</span></div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><motion.div className="h-full bg-blue-500" initial={{width:0}} animate={{width:`${percent}%`}} transition={{duration:0.4}} /></div>
          <div className="text-sm mt-1">✅ {doneCount}/{total} selesai — 🕒 {dailyCount} daily</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input type="text" placeholder="Tambah project..." className="input col-span-2" value={newProject} onChange={(e)=>setNewProject(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={addProject} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Tambah</button>
            <button onClick={syncToSheet} className="bg-indigo-600 text-white px-3 py-2 rounded-lg">Sync</button>
            <button onClick={loadFromSheet} className="bg-amber-600 text-white px-3 py-2 rounded-lg">Load</button>
          </div>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {projects.map(p => (
              <motion.div key={p.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-10}} transition={{duration:0.12}} className={`flex justify-between items-center p-3 rounded-lg border ${p.done?'bg-green-100 dark:bg-green-900':'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={p.done} onChange={()=>toggleDone(p.id)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`${p.done?'line-through text-gray-500':''}`}>{p.name}</div>
                      {p.details?.website ? (
                        <a className="external-link" href={p.details.website} target="_blank" rel="noreferrer" title="Open official website">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm8 10c0 .9-.12 1.76-.34 2.58l-4.24-4.24A3.5 3.5 0 0118 12zM6.34 9.42L10.58 13.66A3.5 3.5 0 0112 10.5c0-.96-.36-1.83-.94-2.5L6.34 9.42z"/></svg>
                        </a>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500">{p.details?.website || p.details?.twitter || ""}</div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={()=>toggleDaily(p.id)} className={`text-xs px-2 py-1 rounded-md ${p.daily?'bg-yellow-500 text-white':'bg-gray-200 dark:bg-gray-700'}`}>{p.daily?'Daily':'Set Daily'}</button>
                  <button onClick={()=>setSelected(p)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md flex items-center gap-1"><Edit size={14}/> Detail</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-between pt-4">
          <button onClick={resetDaily} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg"><RefreshCcw size={16}/> Reset Daily</button>
          <div className="flex gap-2">
            <button onClick={()=>{ if(Notification.permission==='granted') new Notification('Test Reminder','Ini adalah tes reminder jam 09:00'); }} className="bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"><Bell size={16}/> Test Reminder</button>
            <button onClick={clearCompleted} className="bg-red-600 text-white px-3 py-2 rounded-lg"><Trash2 size={16}/> Clear Completed</button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-[90%] max-w-lg" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}>
              <h2 className="text-lg font-semibold mb-2">Detail: {selected.name}</h2>
              <div className="grid grid-cols-1 gap-2">
                <label className="text-xs">Twitter</label>
                <input type="text" defaultValue={selected.details?.twitter||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, twitter:e.target.value}}))} className="input w-full" placeholder="@handle or link" />
                <label className="text-xs">Discord</label>
                <input type="text" defaultValue={selected.details?.discord||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, discord:e.target.value}}))} className="input w-full" placeholder="discord invite or username" />
                <label className="text-xs">Telegram</label>
                <input type="text" defaultValue={selected.details?.telegram||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, telegram:e.target.value}}))} className="input w-full" placeholder="telegram link or username" />
                <label className="text-xs">Wallet Address</label>
                <input type="text" defaultValue={selected.details?.wallet||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, wallet:e.target.value}}))} className="input w-full" placeholder="0x..." />
                <label className="text-xs">Email</label>
                <input type="email" defaultValue={selected.details?.email||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, email:e.target.value}}))} className="input w-full" placeholder="email@example.com" />
                <label className="text-xs">Official Website</label>
                <input type="text" defaultValue={selected.details?.website||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, website:e.target.value}}))} className="input w-full" placeholder="https://official.site" />
                <label className="text-xs">Notes</label>
                <textarea defaultValue={selected.details?.note||''} onChange={(e)=>setSelected(prev=>({...prev, details:{...prev.details, note:e.target.value}}))} className="input w-full" rows={3} placeholder="catatan..." />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={()=>setSelected(null)} className="px-3 py-2 rounded-lg bg-gray-300 dark:bg-gray-700">Batal</button>
                <button onClick={()=>updateDetails(selected.id, selected.details)} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}