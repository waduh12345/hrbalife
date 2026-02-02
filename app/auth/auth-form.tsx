"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Leaf, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useRegisterMutation } from "@/services/auth.service";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "login" | "register";

interface AuthFormProps {
  mode?: Mode;
}

export default function ModernAuthForm({ mode: initialMode = "login" }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const [registerMutation] = useRegisterMutation();
  const isLogin = mode === "login";

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    if (isLogin) {
      // Login Logic
      if (!formData.email || !formData.password) {
        setError("Email dan password wajib diisi");
        setIsLoading(false);
        return;
      }

      try {
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInRes?.ok) {
          setSuccessMsg("Login berhasil! Mengarahkan...");
          setTimeout(() => {
            router.push("/me");
            router.refresh();
          }, 1000);
        } else {
          setError("Email atau password salah. Silakan coba lagi.");
        }
      } catch (err: unknown) {
        console.error("Login error:", err);
        setError("Terjadi kesalahan saat login. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Register Logic
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError("Semua field wajib diisi");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.passwordConfirmation) {
        setError("Konfirmasi password tidak cocok");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password minimal 8 karakter");
        setIsLoading(false);
        return;
      }

      try {
        await registerMutation({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.passwordConfirmation,
        }).unwrap();

        setSuccessMsg("Registrasi berhasil! Silakan login.");
        setTimeout(() => {
          setMode("login");
          setFormData((prev) => ({ ...prev, password: "", passwordConfirmation: "" }));
        }, 2000);
      } catch (err: unknown) {
        const apiErr = err as { data?: { message?: string } };
        const message =
          apiErr?.data?.message || "Registrasi gagal. Silakan coba lagi.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Side - Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6"
            >
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">HerbalCare</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            >
              {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              {isLogin
                ? "Masuk ke akun Anda untuk melanjutkan belanja produk herbal premium"
                : "Bergabunglah dengan komunitas kesehatan alami HerbalCare"}
            </motion.p>
          </div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-700">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="+62 812 3456 7890"
                      required
                    />
                  </div>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.5 : 0.7 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.6 : 0.8 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.passwordConfirmation}
                    onChange={(e) =>
                      handleChange("passwordConfirmation", e.target.value)
                    }
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Lupa Password?
                </button>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.8 : 1 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? "Memproses..." : "Mendaftarkan..."}
                </>
              ) : (
                <>
                  {isLogin ? "Masuk" : "Daftar"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isLogin ? 0.9 : 1.1 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(isLogin ? "register" : "login");
                  setError("");
                  setSuccessMsg("");
                  setFormData({
                    name: "",
                    phone: "",
                    email: isLogin ? formData.email : "",
                    password: "",
                    passwordConfirmation: "",
                  });
                }}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                {isLogin ? "Daftar sekarang" : "Masuk"}
              </button>
            </p>
          </motion.div>

          {!isLogin && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-xs text-center text-gray-500 px-4"
            >
              Dengan membuat akun, Anda menyetujui{" "}
              <a href="/terms" className="text-green-600 hover:underline">
                Syarat dan Ketentuan
              </a>{" "}
              serta{" "}
              <a href="/privacy" className="text-green-600 hover:underline">
                Kebijakan Privasi
              </a>{" "}
              kami
            </motion.p>
          )}
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:flex bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                Aman & Terpercaya
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Kesehatan Alami untuk Gaya Hidup Modern
            </h2>
            <p className="text-green-100 text-lg">
              Temukan produk herbal premium yang didukung oleh penelitian
              ilmiah untuk kesehatan optimal Anda.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            {[
              {
                icon: "🌿",
                title: "100% Alami",
                desc: "Produk herbal murni tanpa bahan kimia",
              },
              {
                icon: "🔬",
                title: "Teruji Ilmiah",
                desc: "Didukung oleh penelitian dan ahli",
              },
              {
                icon: "✨",
                title: "Kualitas Premium",
                desc: "Standar tinggi untuk kesehatan optimal",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-green-100">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-4 pt-8 border-t border-white/20">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-green-100 border-2 border-white"
                ></div>
              ))}
            </div>
            <div>
              <p className="text-white font-medium">
                Dipercaya oleh 50,000+ pelanggan
              </p>
              <p className="text-green-100 text-sm">
                Bergabunglah dengan komunitas kesehatan kami
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}