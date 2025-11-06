import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
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
    <div className="relative flex items-center justify-center min-h-screen text-white bg-[#040b2a] overflow-hidden">
      <NeonParticles />

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-8 bg-[#0a0f3c] text-yellow-300 border border-yellow-400 px-6 py-2 rounded-md shadow-md font-medium"
        >
          {error}
        </motion.div>
      )}

      {/* Login Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-[#07113a] bg-opacity-95 p-10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] border border-[#101c52] w-[90%] max-w-sm text-center"
      >
        <h1 className="text-3xl font-bold mb-10">
          <span className="text-[#40c8ff]">Airdrop</span>{" "}
          <span className="text-[#ff66c4]">Tracker Login</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="flex flex-col text-left">
            <label className="text-[#f7c948] text-sm mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full p-3 bg-[#0a1648] border border-[#152768] text-white placeholder-[#f7c948] rounded-md shadow-inner focus:outline-none focus:ring-1 focus:ring-[#40c8ff]"
              placeholder="Username"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col text-left">
            <label className="text-[#f7c948] text-sm mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 bg-[#0a1648] border border-[#152768] text-white placeholder-[#f7c948] rounded-md shadow-inner focus:outline-none focus:ring-1 focus:ring-[#40c8ff]"
              placeholder="Password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full mt-6 py-3 bg-[#ffd43b] text-[#0b0e2c] font-bold tracking-wider uppercase rounded-md hover:bg-[#ffcd00] transition"
          >
            LOGIN
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
