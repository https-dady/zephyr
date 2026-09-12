import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Container from "../components/Container";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.message || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const email = formData.email.trim();

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to log in. Please check your credentials."
        );
      }

      if (!result.data?.token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      /*
       * Store authentication state centrally.
       * AuthContext expects:
       * login(token, userData)
       */
      login(
        result.data.token,
        result.data.user
      );

      /*
       * Remove temporary signup/login state so it does not
       * reappear after future navigation.
       */
      window.history.replaceState({}, document.title);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (loginError) {
      console.error("Login error:", loginError);

      setError(
        loginError?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[420px] w-[420px] rounded-full bg-orange-500/5 blur-[130px]" />

        <div className="absolute right-[-160px] top-[35%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[130px]" />
      </div>

      <Container className="relative flex min-h-screen items-center justify-center py-12 sm:py-16">
        <div className="grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Left RPG message */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="hidden lg:block"
          >
            <div className="max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />

                Continue Your Adventure
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Enter your
                <span className="block text-amber-300">
                  realm.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-neutral-500">
                Log in to continue your progression, complete
                quests, maintain your streak and keep building
                your character.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  {
                    icon: "✦",
                    title: "Continue Progress",
                    text: "Your XP, level and character data stay with you.",
                  },
                  {
                    icon: "◇",
                    title: "Keep Your Streak",
                    text: "Return to your journey and keep making progress.",
                  },
                  {
                    icon: "◆",
                    title: "Own Your Journey",
                    text: "Your tasks and RPG data belong to your account.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.25 + index * 0.1,
                    }}
                    className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.025] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/5 text-sm text-amber-300">
                      {item.icon}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        {item.title}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="mx-auto w-full max-w-md"
          >
            <div className="relative">
              {/* Card glow */}
              <div className="absolute inset-8 rounded-full bg-amber-300/10 blur-[90px]" />

              <div className="relative rounded-[30px] border border-white/10 bg-neutral-900/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                {/* Mobile heading */}
                <div className="lg:hidden">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Continue Your Adventure
                  </div>
                </div>

                {/* Header */}
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.07)]">
                    ✦
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Enter your realm and continue your Life RPG
                    journey.
                  </p>
                </div>

                {/* Success */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3"
                    role="status"
                  >
                    <p className="text-sm leading-6 text-emerald-300">
                      {success}
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/5 px-4 py-3"
                    role="alert"
                  >
                    <p className="text-sm leading-6 text-red-300">
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-neutral-300"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />

                        Entering Realm...
                      </>
                    ) : (
                      <>
                        Enter Your Realm

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/7" />

                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-700">
                    New to the journey?
                  </span>

                  <div className="h-px flex-1 bg-white/7" />
                </div>

                {/* Signup */}
                <Button
                  to="/signup"
                  variant="secondary"
                  className="w-full border-white/10 bg-white/[0.025] text-neutral-200 hover:border-amber-300/20 hover:bg-white/[0.05]"
                >
                  Create Your Character
                </Button>

                {/* Footer */}
                <p className="mt-6 text-center text-[11px] leading-5 text-neutral-700">
                  Your account is securely authenticated through
                  the application backend.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </main>
  );
}

export default Login;