import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import NeonParticles from "./NeonParticles";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      setError("❌ Username atau password salah!");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen text-white overflow-hidden">
      <NeonParticles />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-gray-900 bg-opacity-80 p-8 rounded-2xl shadow-lg border border-gray-700 w-[90%] max-w-md text-center"
      >
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🚀 Airdrop Tracker Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-cyan-400 outline-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:opacity-90 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
