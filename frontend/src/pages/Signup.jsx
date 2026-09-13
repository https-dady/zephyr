import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Container from "../components/Container";
import Button from "../components/Button";

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_STORAGE_KEY =
  "verification_resend_available_at";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

    if (success) {
      setSuccess("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const email = formData.email.trim();

      const response = await fetch(
        "https://zephyr-1-8h6x.onrender.com/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to create your account. Please try again."
        );
      }

      localStorage.setItem(
        "pending_signup_email",
        email
      );

      /*
       * The signup request has already triggered the
       * first verification OTP.
       *
       * Start the 60-second resend cooldown immediately
       * so the user cannot request another OTP right away.
       */
      const resendAvailableAt =
        Date.now() +
        RESEND_COOLDOWN_SECONDS * 1000;

      localStorage.setItem(
        RESEND_COOLDOWN_STORAGE_KEY,
        String(resendAvailableAt)
      );

      setSuccess(
        result.message ||
          "Account created successfully. Please verify your email."
      );

      navigate("/verify-email", {
        state: {
          email,
        },
      });
    } catch (submitError) {
      console.error("Signup error:", submitError);

      setError(
        submitError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[420px] w-[420px] rounded-full bg-orange-500/5 blur-[130px]" />

        <div className="absolute right-[-160px] top-[35%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[130px]" />
      </div>

      <Container className="relative flex min-h-screen items-center justify-center py-12 sm:py-16">
        <div className="grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* =====================================================
              LEFT RPG MESSAGE
          ====================================================== */}

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
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]"
                  aria-hidden="true"
                />

                Begin Your Adventure
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Build your
                <span className="block text-amber-300">
                  character.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-neutral-500">
                Create your account and turn the things you already do
                into quests. Your journey begins at Level 1 and grows
                with every completed task.
              </p>

              {/* Progress pillars */}

              <div className="mt-10 space-y-3">
                {[
                  {
                    icon: "✦",
                    title: "Start at Level 1",
                    text: "Begin your progression and build your character from the ground up.",
                  },
                  {
                    icon: "◇",
                    title: "Turn Actions Into Progress",
                    text: "Your real-world tasks become meaningful steps in your journey.",
                  },
                  {
                    icon: "◆",
                    title: "Grow Over Time",
                    text: "Earn XP, develop attributes and keep your streak alive.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.25 + index * 0.1,
                    }}
                    className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.025] p-4"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/5 text-sm text-amber-300"
                      aria-hidden="true"
                    >
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

          {/* =====================================================
              SIGNUP CARD
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
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
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-amber-300"
                      aria-hidden="true"
                    />

                    Begin Your Adventure
                  </div>
                </div>

                {/* Header */}

                <div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.07)]"
                    aria-hidden="true"
                  >
                    ✦
                  </div>

                  <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                    Create your character
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Start your Life RPG journey and begin turning
                    everyday actions into progression.
                  </p>
                </div>

                {/* Error */}

                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/5 px-4 py-3"
                    role="alert"
                    aria-live="assertive"
                    id="signup-error"
                  >
                    <p className="text-sm leading-6 text-red-300">
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Success */}

                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3"
                    role="status"
                    aria-live="polite"
                    id="signup-success"
                  >
                    <p className="text-sm leading-6 text-amber-200">
                      {success}
                    </p>
                  </motion.div>
                )}

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                  noValidate
                >
                  {/* Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Character Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      aria-required="true"
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? "signup-error"
                          : success
                          ? "signup-success"
                          : undefined
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

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
                      aria-required="true"
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? "signup-error"
                          : success
                          ? "signup-success"
                          : undefined
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

                  {/* Password */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      minLength={6}
                      aria-required="true"
                      aria-invalid={Boolean(
                        error &&
                          (
                            formData.password.length > 0 ||
                            formData.confirmPassword.length > 0
                          )
                      )}
                      aria-describedby={
                        error
                          ? "signup-error password-hint"
                          : "password-hint"
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />

                    <p
                      id="password-hint"
                      className="mt-2 text-[11px] text-neutral-700"
                    >
                      Use at least 6 characters.
                    </p>
                  </div>

                  {/* Confirm Password */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Confirm Password
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Enter your password again"
                      required
                      minLength={6}
                      aria-required="true"
                      aria-invalid={Boolean(
                        error &&
                          formData.confirmPassword.length > 0
                      )}
                      aria-describedby={
                        error
                          ? "signup-error password-match-hint"
                          : "password-match-hint"
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                    />

                    <p
                      id="password-match-hint"
                      className="sr-only"
                    >
                      Re-enter the same password to confirm it.
                    </p>
                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    aria-disabled={isLoading}
                    aria-busy={isLoading}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950"
                          aria-hidden="true"
                        />

                        <span>
                          Creating Character...
                        </span>

                        <span className="sr-only">
                          Account creation in progress
                        </span>
                      </>
                    ) : (
                      <>
                        Create My Character

                        <span
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}

                <div
                  className="my-7 flex items-center gap-4"
                  aria-hidden="true"
                >
                  <div className="h-px flex-1 bg-white/7" />

                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-700">
                    Already on the journey?
                  </span>

                  <div className="h-px flex-1 bg-white/7" />
                </div>

                {/* Login */}

                <Button
                  to="/login"
                  variant="secondary"
                  className="w-full border-white/10 bg-white/[0.025] text-neutral-200 hover:border-amber-300/20 hover:bg-white/[0.05]"
                >
                  Enter Your Existing Realm
                </Button>

                {/* Footer note */}

                <p className="mt-6 text-center text-[11px] leading-5 text-neutral-700">
                  Your account is created securely through the application
                  backend. Email verification is part of the existing
                  authentication flow.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </main>
  );
}

export default Signup;