import React, { useState } from "react";
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
    <div className="relative flex items-center justify-center min-h-screen bg-[#030b2a] text-white overflow-hidden font-sans">
      <NeonParticles />

      {/* Error bar */}
      {error && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-6 bg-[#08103a] text-[#ffdf5b] px-4 py-2 text-sm rounded-md flex items-center border-l-4 border-[#ffd43b] shadow-md"
        >
          {error}
        </motion.div>
      )}

      {/* Login Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-[#0a1138] p-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] w-[90%] max-w-sm text-center border border-[#121b50]"
      >
        <h1 className="text-3xl font-bold mb-10">
          <span className="text-[#5ad3ff]">Airdrop</span>{" "}
          <span className="text-[#ff6bd6]">Tracker Login</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="text-left">
            <label className="block text-[#ffdf5b] text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="Username"
              className="w-full bg-[#0f1852] text-[#ffdf5b] placeholder-[#ffdf5b]/60 px-4 py-3 rounded-md border border-[#19205c] focus:border-[#5ad3ff] outline-none text-sm"
            />
          </div>

          {/* Password Field */}
          <div className="text-left">
            <label className="block text-[#ffdf5b] text-sm mb-2">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Password"
              className="w-full bg-[#0f1852] text-[#ffdf5b] placeholder-[#ffdf5b]/60 px-4 py-3 rounded-md border border-[#19205c] focus:border-[#5ad3ff] outline-none text-sm"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-[#ffdf5b] hover:bg-[#ffd43b] text-[#0a1138] font-bold tracking-wide py-3 rounded-md uppercase transition-all duration-200"
          >
            LOGIN
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
