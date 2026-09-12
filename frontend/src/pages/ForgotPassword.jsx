import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Container from "../components/Container";
import Button from "../components/Button";

const API_BASE_URL = "http://localhost:5000/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =========================================================
     STEP 1 — SEND RESET OTP
  ========================================================== */

  const handleEmailSubmit = async (event) => {
    event.preventDefault();

    clearMessages();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to send reset OTP. Please try again."
        );
      }

      setSuccess(
        result.message ||
          "Reset OTP has been sent to your email."
      );

      setStep(2);
    } catch (submitError) {
      setError(
        submitError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     STEP 2 — VERIFY RESET OTP
  ========================================================== */

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    clearMessages();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Invalid or expired OTP. Please try again."
        );
      }

      setSuccess(
        result.message ||
          "OTP verified successfully. You can now create a new password."
      );

      setStep(3);
    } catch (submitError) {
      setError(
        submitError.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     STEP 3 — RESET PASSWORD
  ========================================================== */

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    clearMessages();

    if (
      passwordData.password !== passwordData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otp.trim(),
            password: passwordData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to reset password. Please try again."
        );
      }

      setSuccess(
        result.message ||
          "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (submitError) {
      setError(
        submitError.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  const goBackToLogin = () => {
    navigate("/login");
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
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="max-w-md">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                Account Recovery
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Find your way
                <span className="block text-amber-300">
                  back to the journey.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-neutral-500">
                Forgot your password? Recover your account securely
                and get back to completing quests, building your
                character and progressing through your journey.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  {
                    number: "01",
                    title: "Verify your account",
                    text: "Enter the email connected to your Life RPG account.",
                  },
                  {
                    number: "02",
                    title: "Confirm the OTP",
                    text: "Use the reset code sent to your registered email.",
                  },
                  {
                    number: "03",
                    title: "Create a new password",
                    text: "Set a new password and return to your journey.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.number}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.25 + index * 0.1,
                    }}
                    className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.025] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/5 text-xs font-medium text-amber-300">
                      {item.number}
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
              FORGOT PASSWORD CARD
          ====================================================== */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto w-full max-w-md"
          >
            <div className="relative">
              <div className="absolute inset-8 rounded-full bg-amber-300/10 blur-[90px]" />

              <div className="relative rounded-[30px] border border-white/10 bg-neutral-900/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                {/* Header */}
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.07)]">
                    {step === 1 && "↗"}
                    {step === 2 && "#"}
                    {step === 3 && "✦"}
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                    {step === 1 && "Recover your account"}
                    {step === 2 && "Verify your OTP"}
                    {step === 3 && "Create a new password"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {step === 1 &&
                      "Enter your account email and we'll send you a reset OTP."}

                    {step === 2 &&
                      "Enter the reset OTP sent to your registered email."}

                    {step === 3 &&
                      "Your OTP is verified. Set a new password for your account."}
                  </p>
                </div>

                {/* =================================================
                    STEP INDICATOR
                ================================================== */}
                <div className="mt-7 grid grid-cols-3 gap-2">
                  {["Email", "Verify", "Reset"].map(
                    (label, index) => {
                      const stepNumber = index + 1;

                      return (
                        <div key={label}>
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              stepNumber <= step
                                ? "bg-amber-300"
                                : "bg-neutral-800"
                            }`}
                          />

                          <p
                            className={`mt-2 text-[10px] ${
                              stepNumber <= step
                                ? "text-amber-300"
                                : "text-neutral-700"
                            }`}
                          >
                            {label}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* =================================================
                    MESSAGES
                ================================================== */}
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

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3"
                    role="status"
                  >
                    <p className="text-sm leading-6 text-amber-200">
                      {success}
                    </p>
                  </motion.div>
                )}

                {/* =================================================
                    STEP 1 — EMAIL
                ================================================== */}
                {step === 1 && (
                  <form
                    onSubmit={handleEmailSubmit}
                    className="mt-7 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Account Email
                      </label>

                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearMessages();
                        }}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send Reset OTP

                          <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* =================================================
                    STEP 2 — OTP
                ================================================== */}
                {step === 2 && (
                  <form
                    onSubmit={handleOtpSubmit}
                    className="mt-7 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="reset-otp"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Reset OTP
                      </label>

                      <input
                        id="reset-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => {
                          const value =
                            event.target.value.replace(
                              /\D/g,
                              ""
                            );

                          setOtp(value);
                          clearMessages();
                        }}
                        placeholder="Enter your OTP"
                        required
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-center text-lg font-semibold tracking-[0.35em] text-white outline-none transition-all duration-200 placeholder:text-neutral-700 placeholder:tracking-normal focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />
                    </div>

                    <p className="text-center text-xs leading-5 text-neutral-700">
                      Check the email address you entered in the
                      previous step.
                    </p>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP

                          <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* =================================================
                    STEP 3 — NEW PASSWORD
                ================================================== */}
                {step === 3 && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="mt-7 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        New Password
                      </label>

                      <input
                        id="new-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        placeholder="Create a new password"
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-new-password"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Confirm New Password
                      </label>

                      <input
                        id="confirm-new-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter the password again"
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />
                    </div>

                    <p className="text-[11px] text-neutral-700">
                      Password must be at least 6 characters long.
                    </p>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          Reset Password

                          <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={goBackToLogin}
                  className="mt-6 flex w-full items-center justify-center gap-2 text-xs text-neutral-600 transition-colors hover:text-amber-300"
                >
                  <span>←</span>
                  Back to Login
                </button>

                {/* Login link */}
                <p className="mt-5 text-center text-[11px] leading-5 text-neutral-700">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="text-amber-300/60 transition-colors hover:text-amber-300"
                  >
                    Enter the Realm
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </main>
  );
}

export default ForgotPassword;