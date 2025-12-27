import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

// --- 1. MODULAR COMPONENT: Input Field ---
// Handles layout, icons, focus states, and the password toggle logic internally.
const InputField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white/80 ml-1">{label}</label>
      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors">
          <Icon size={20} />
        </div>

        {/* The Input */}
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-12 text-white placeholder-white/30 backdrop-blur-sm focus:border-indigo-500/50 focus:bg-black/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
        />

        {/* Password Toggle Button (Right Side) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- 2. MODULAR COMPONENT: Submit Button ---
// Includes a hover animation and click effect.
const SubmitButton = ({ text, isLoading }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={isLoading}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-70 transition-all duration-300"
    >
      {isLoading ? "Signing In..." : text}
      {!isLoading && <ArrowRight size={20} />}
    </motion.button>
  );
};

// --- 3. MAIN LAYOUT ---
const LoginLayout = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Logged in:", { email, password });
      setIsLoading(false);
    }, 2000);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Decor (Glow Orbs) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[100px]" />

      {/* Glass Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          <div className="p-8">
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Please enter your details to sign in
              </p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div variants={itemVariants}>
                <InputField
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <SubmitButton text="Sign In" isLoading={isLoading} />
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-sm text-white/50">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create Account
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginLayout;
