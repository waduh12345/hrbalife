// components/auth/LoginPage.tsx
"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Heart,
  User,
  Phone,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

// --- Mocking Unused Hooks for UI isolation ---
type RegisterSuccess = { message?: string };
type TriggerReturn<T> = Promise<T> & { unwrap: () => Promise<T> };

const useRegisterMutation = () => {
  const trigger = (
    payload: RegisterPayload
  ): TriggerReturn<RegisterSuccess> => {
    const p = new Promise<RegisterSuccess>((resolve) => {
      setTimeout(() => resolve({ message: "ok" }), 1000);
    }) as TriggerReturn<RegisterSuccess>;
    p.unwrap = () => p;
    return p;
  };
  return [trigger, { isLoading: false }] as const;
};
// --- End Mock ---

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

interface ForgotPasswordData {
  email: string;
}

interface OtpFormData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

// Animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [forgotPasswordData, setForgotPasswordData] =
    useState<ForgotPasswordData>({
      email: "",
    });

  const [otpFormData, setOtpFormData] = useState<OtpFormData>({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [isSendingResetLink, setIsSendingResetLink] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [registerMutation, { isLoading: isRegistering }] =
    useRegisterMutation();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // ===== Handlers =====
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const newErrors: string[] = [];
    if (!loginData.email) newErrors.push("Email wajib diisi");
    if (!loginData.password) newErrors.push("Password wajib diisi");
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoggingIn(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });

      if (res?.ok) {
        setSuccessMsg("Berhasil masuk. Mengarahkan…");
        router.push("/me");
      } else {
        setErrors(["Gagal masuk. Email atau password salah."]);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors(["Login gagal. Cek kembali email dan password."]);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const newErrors: string[] = [];
    if (!registerData.fullName) newErrors.push("Nama lengkap wajib diisi");
    if (!registerData.email) newErrors.push("Email wajib diisi");
    if (!registerData.phone) newErrors.push("Nomor telepon wajib diisi");
    if (!registerData.password) newErrors.push("Password wajib diisi");
    if (registerData.password.length < 8)
      newErrors.push("Password minimal 8 karakter");
    if (registerData.password !== registerData.confirmPassword)
      newErrors.push("Konfirmasi password tidak sesuai");
    if (!registerData.agreeToTerms)
      newErrors.push("Anda harus menyetujui syarat dan ketentuan");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: RegisterPayload = {
      name: registerData.fullName,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      password_confirmation: registerData.confirmPassword,
    };

    try {
      await registerMutation(payload).unwrap();
      setSuccessMsg("Registrasi berhasil! Silakan masuk.");
      setLoginData((p) => ({ ...p, email: registerData.email }));
      setIsLogin(true);
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      const msg = apiErr?.data?.message ?? "Registrasi gagal. Coba lagi.";
      setErrors([msg]);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    if (!forgotPasswordData.email) {
      setErrors(["Email wajib diisi"]);
      return;
    }

    setIsSendingResetLink(true);
    try {
      const response = { ok: true, json: () => ({}) };
      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Kode reset password telah dikirim ke email Anda. Silakan periksa inbox dan masukkan kode di bawah."
        );
        setOtpFormData((prev) => ({
          ...prev,
          email: forgotPasswordData.email,
        }));
        setShowForgotPassword(false);
        setShowOtpForm(true);
      } else {
        const message =
          (data as { message?: string }).message ||
          "Gagal mengirim kode reset password. Silakan coba lagi.";
        setErrors([message]);
      }
    } catch (err) {
      setErrors(["Terjadi kesalahan saat mengirim permintaan."]);
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg(null);

    const { email, otp, password, confirmPassword } = otpFormData;

    const newErrors: string[] = [];
    if (!otp) newErrors.push("Kode OTP wajib diisi");
    if (!password) newErrors.push("Password baru wajib diisi");
    if (password.length < 8) newErrors.push("Password minimal 8 karakter");
    if (password !== confirmPassword)
      newErrors.push("Konfirmasi password tidak sesuai");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = { ok: true, json: () => ({}) };
      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Password berhasil diubah. Silakan masuk dengan password baru Anda."
        );
        setShowOtpForm(false);
        setIsLogin(true);
        setLoginData((prev) => ({ ...prev, email }));
      } else {
        const message =
          (data as { message?: string }).message ||
          "Gagal mengubah password. Pastikan kode OTP benar.";
        setErrors([message]);
      }
    } catch (err) {
      setErrors(["Terjadi kesalahan saat memvalidasi OTP."]);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // --- Forgot Password Form ---
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={scaleIn}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-green-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Lupa Password?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Masukkan email Anda dan kami akan mengirimkan kode verifikasi
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={(e) =>
                    setForgotPasswordData({ email: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setErrors([]);
                  setSuccessMsg(null);
                }}
                className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSendingResetLink}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                {isSendingResetLink ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Kode
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  } else if (showOtpForm) {
    // --- OTP Form ---
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial="hidden"
          animate="show"
          variants={scaleIn}
          className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-green-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Verifikasi & Reset Password
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Masukkan kode OTP dan password baru Anda
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kode OTP
              </label>
              <input
                type="text"
                value={otpFormData.otp}
                onChange={(e) =>
                  setOtpFormData((prev) => ({ ...prev, otp: e.target.value }))
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-bold text-xl tracking-[0.5em] text-gray-900"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={otpFormData.password}
                  onChange={(e) =>
                    setOtpFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Minimal 8 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={otpFormData.confirmPassword}
                  onChange={(e) =>
                    setOtpFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Ulangi password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpForm(false);
                  setShowForgotPassword(true);
                  setErrors([]);
                  setSuccessMsg(null);
                }}
                className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                {isVerifyingOtp ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Reset Password
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- Login/Register Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-10"></div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={scaleIn}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100 relative z-10"
      >
        {/* Left Sidebar - HerbalCare Branding */}
        <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
          {/* Decorative Shapes */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-white rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full" />
          </div>

          <div className="relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="text-green-700 cursor-pointer shadow-lg border-white bg-white hover:bg-green-50 transition-all mb-6 font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  HerbalCare
                </h1>
                <p className="text-green-100 text-sm">Kesehatan Alami</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white">
                {isLogin
                  ? "Selamat Datang Kembali!"
                  : "Bergabung dengan Kami"}
              </h2>
              <p className="text-green-100 text-base lg:text-lg leading-relaxed">
                {isLogin
                  ? "Masuk untuk mengakses akun Anda, melacak pesanan, dan mengelola profil dengan mudah."
                  : "Daftar sekarang untuk menikmati produk herbal berkualitas, akses eksklusif, dan manfaat kesehatan alami."}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-50 font-medium">100% Bahan Alami</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-50 font-medium">Tersertifikasi BPOM & Halal</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-50 font-medium">Dipercaya 10,000+ Pelanggan</span>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-green-100 text-xs sm:text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-green-100 text-xs sm:text-sm">Pelanggan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-green-100 text-xs sm:text-sm">Alami</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="p-6 sm:p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {isLogin ? "Masuk Akun" : "Daftar Baru"}
                </span>
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {isLogin
                  ? "Masukkan kredensial Anda untuk melanjutkan"
                  : "Isi detail di bawah untuk bergabung dengan HerbalCare"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">Terjadi Kesalahan:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">{successMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            {isLogin ? (
              <motion.form
                key="login"
                initial="hidden"
                animate="show"
                variants={fadeUp}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">
                      Ingat saya
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setErrors([]);
                      setSuccessMsg(null);
                      setForgotPasswordData({ email: loginData.email });
                    }}
                    className="text-green-600 font-semibold hover:text-green-700 hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              // Register Form
              <motion.form
                key="register"
                initial="hidden"
                animate="show"
                variants={fadeUp}
                onSubmit={handleRegisterSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={registerData.agreeToTerms}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        agreeToTerms: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Saya setuju dengan{" "}
                    <a
                      href="/terms"
                      className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                    >
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a
                      href="/privacy"
                      className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                    >
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin((v) => !v);
                    setErrors([]);
                    setSuccessMsg(null);
                  }}
                  className="text-green-600 font-semibold hover:text-green-700 hover:underline"
                >
                  {isLogin ? "Daftar di sini" : "Masuk di sini"}
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>SSL Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data Terlindungi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
