
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { Leaf, Eye, EyeOff, ArrowRight, Mail, Lock, User, Sparkles } from "lucide-react";
import api from "../services/api";

type PlannixUser = {
  name: string;
  email: string;
};

type AuthPageProps = {
  onLogin: (user: PlannixUser) => void;
};

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (register: boolean) => {
    setIsRegister(register);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (isRegister && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
        ? { name: name.trim(), email: cleanEmail, password }
        : { email: cleanEmail, password };

      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid server response.");
      }

      localStorage.setItem("plannix-token", token);

      if (isRegister) {
        setSuccess("Account created successfully! Please login.");
        setIsRegister(false);
        setName("");
        setPassword("");
        return;
      }

      onLogin({
        name: user.name,
        email: user.email,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f3f6f0] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[#294436]/10 grid md:grid-cols-2">
        <section className="hidden md:flex flex-col justify-between min-h-[650px] bg-[#263f32] text-white p-12">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#dce9d8] text-[#355540] flex items-center justify-center">
              <Leaf size={22} />
            </div>
            <span className="text-2xl font-bold">plannix.</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-[#d5e3d4] mb-6">
              <Sparkles size={14} /> A calmer way to get things done
            </div>
            <h1 className="text-4xl font-semibold leading-tight">
              Make room for
              <br />
              <span className="text-[#c1d7b9]">what matters.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              Organize your tasks, find your focus, and make progress at your own pace. One small step at a time.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="h-9 w-9 rounded-full border-2 border-[#263f32] bg-[#c8d9c4] flex items-center justify-center text-xs font-bold text-[#35513c]">P</span>
                <span className="h-9 w-9 rounded-full border-2 border-[#263f32] bg-[#e4cbb7] flex items-center justify-center text-xs font-bold text-[#35513c]">M</span>
                <span className="h-9 w-9 rounded-full border-2 border-[#263f32] bg-[#b7c9be] flex items-center justify-center text-xs font-bold text-[#35513c]">J</span>
              </div>
              <span className="text-xs text-white/60">Progress over perfection.</span>
            </div>
          </div>

          <p className="text-xs text-white/40">
            © 2026 Plannix · Made for mindful productivity.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-12 min-h-[650px]">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-8 md:hidden">
              <div className="h-10 w-10 rounded-xl bg-[#dce9dc] text-[#355b43] flex items-center justify-center">
                <Leaf size={20} />
              </div>
              <span className="text-xl font-bold text-[#294436]">plannix.</span>
            </div>

            <div className="mb-7">
              <p className="text-xs font-semibold tracking-[2px] text-[#829583]">
                YOUR PRODUCTIVITY SPACE
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[#263f32]">
                {isRegister ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-[#8a978c]">
                {isRegister
                  ? "Start building a routine that works for you."
                  : "Pick up where you left off. You've got this."}
              </p>
            </div>

            <div className="flex rounded-xl bg-[#f2f5f0] p-1 mb-6">
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`w-1/2 rounded-lg py-3 text-sm font-medium ${!isRegister ? "bg-white text-[#34523d] shadow-sm" : "text-[#879488]"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`w-1/2 rounded-lg py-3 text-sm font-medium ${isRegister ? "bg-white text-[#34523d] shadow-sm" : "text-[#879488]"}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-[#44594a] mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aaa9b]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-[#e6ebe4] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#8da68e] focus:ring-4 focus:ring-[#dce9dc]/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#44594a] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aaa9b]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-[#e6ebe4] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#8da68e] focus:ring-4 focus:ring-[#dce9dc]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#44594a] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aaa9b]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    className="w-full rounded-xl border border-[#e6ebe4] py-3 pl-11 pr-12 text-sm outline-none focus:border-[#8da68e] focus:ring-4 focus:ring-[#dce9dc]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#93a194]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-100 bg-green-50 px-3.5 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {!isRegister && (
                <p className="text-right text-xs text-[#829183]">
                  Welcome back to your workspace 🌿
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2f4a38] py-3.5 text-sm font-semibold text-white transition hover:bg-[#3d5d46] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Login to Plannix"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#8a978c]">
              {isRegister ? "Already have an account?" : "New to Plannix?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(!isRegister)}
                className="font-semibold text-[#47654d]"
              >
                {isRegister ? "Login instead" : "Create an account"}
              </button>
            </p>

            <p className="mt-8 border-t border-[#edf0eb] pt-5 text-center text-xs text-[#a0aba1]">
              By continuing, you agree to use Plannix mindfully ✳
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
