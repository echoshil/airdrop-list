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
      setError("Invalid username and/or password! Please try again.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen text-white bg-[#020621] overflow-hidden">
      <NeonParticles />

      {/* Error Bar */}
      {error && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 bg-[#0a0f3c] border border-yellow-400 text-yellow-300 px-6 py-2 rounded-md shadow-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Login Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-[#0c123e] bg-opacity-90 p-10 rounded-3xl shadow-2xl border border-[#1c1f56] w-[90%] max-w-sm text-center backdrop-blur-md"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-cyan-400">Airdrop</span>{" "}
          <span className="text-pink-500">Tracker Login</span>
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-sm text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full p-3 rounded-md bg-[#0e174f] border border-[#1b256b] focus:border-cyan-400 outline-none text-sm placeholder-gray-400"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 rounded-md bg-[#0e174f] border border-[#1b256b] focus:border-cyan-400 outline-none text-sm placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 font-bold tracking-wide hover:opacity-90 flex items-center justify-center gap-2 transition"
          >
            <LogIn size={18} /> LOGIN
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
