import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Container from "../components/Container";

import API_BASE_URL from "../config/api";
const AUTH_EASE = [0.22, 1, 0.36, 1];

const CARD_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 22,
};

const BUTTON_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 24,
};

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

  const [resendCooldown, setResendCooldown] = useState(0);

  /* =========================================================
     RESEND OTP COOLDOWN
  ========================================================== */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) =>
        previous > 0 ? previous - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* =========================================================
     CLEAR MESSAGES
  ========================================================== */

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

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your account email.");
      return;
    }

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
            email: normalizedEmail,
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

      setEmail(normalizedEmail);

      setSuccess(
        result.message ||
          "Reset OTP has been sent to your email."
      );

      setResendCooldown(60);
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
     RESEND RESET OTP
     Uses the existing forgot-password endpoint.
     No new backend route is required.
  ========================================================== */

  const handleResendOtp = async () => {
    if (isLoading || resendCooldown > 0) {
      return;
    }

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
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to resend reset OTP. Please try again."
        );
      }

      setOtp("");

      setSuccess(
        result.message ||
          "A new reset OTP has been sent to your email."
      );

      setResendCooldown(60);
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

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

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
            email: email.trim().toLowerCase(),
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
      passwordData.password !==
      passwordData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordData.password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
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
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
            newPassword: passwordData.password,
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

      navigate("/login", {
        replace: true,
        state: {
          passwordReset: true,
          email: email.trim().toLowerCase(),
        },
      });
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
     PASSWORD INPUT CHANGE
  ========================================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearMessages();
  };

  /* =========================================================
     BACK TO LOGIN
  ========================================================== */

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

                Account Recovery
              </div>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
                Find your way
                <span className="block text-amber-300">
                  back to the journey.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-neutral-500">
                Forgot your password? Recover your account
                securely and get back to completing quests,
                building your character and progressing through
                your journey.
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
                      ease: AUTH_EASE,
                    }}
                    whileHover={{
                      y: -3,
                      x: 2,
                      transition: CARD_SPRING,
                    }}
                    className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.025] p-4"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/10 bg-amber-300/5 text-xs font-medium text-amber-300"
                      aria-hidden="true"
                    >
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
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
              ease: AUTH_EASE,
            }}
            whileHover={{
              y: -2,
              transition: CARD_SPRING,
            }}
            className="mx-auto w-full max-w-md"
          >
            <div className="relative">
              <div className="absolute inset-8 rounded-full bg-amber-300/10 blur-[90px]" />

              <div className="relative rounded-[30px] border border-white/10 bg-neutral-900/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                {/* Header */}

                <div>
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: 5,
                      transition: CARD_SPRING,
                    }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.07)]"
                    aria-hidden="true"
                  >
                    {step === 1 && "↗"}
                    {step === 2 && "#"}
                    {step === 3 && "✦"}
                  </motion.div>

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

                <div
                  className="mt-7 grid grid-cols-3 gap-2"
                  aria-label={`Account recovery step ${step} of 3`}
                >
                  {["Email", "Verify", "Reset"].map(
                    (label, index) => {
                      const stepNumber = index + 1;

                      return (
                        <div
                          key={label}
                          aria-current={
                            stepNumber === step
                              ? "step"
                              : undefined
                          }
                        >
                          <motion.div
                            initial={{
                              scaleX: 0.7,
                              opacity: 0.6,
                            }}
                            animate={{
                              scaleX: 1,
                              opacity: 1,
                            }}
                            transition={{
                              duration: 0.3,
                              ease: AUTH_EASE,
                            }}
                            className={`h-1.5 origin-left rounded-full transition-all duration-300 ${
                              stepNumber <= step
                                ? "bg-amber-300"
                                : "bg-neutral-800"
                            }`}
                            aria-hidden="true"
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
                    id="forgot-error"
                  >
                    <p className="text-sm leading-6 text-red-300">
                      {error}
                    </p>
                  </motion.div>
                )}

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
                    id="forgot-success"
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
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Account Email
                      </label>

                      <motion.input
                        whileFocus={{
                          scale: 1.01,
                          transition: CARD_SPRING,
                        }}
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearMessages();
                        }}
                        placeholder="you@example.com"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                          error
                            ? "forgot-error"
                            : success
                            ? "forgot-success"
                            : undefined
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      aria-disabled={isLoading}
                      aria-busy={isLoading}
                      whileHover={
                        isLoading
                          ? undefined
                          : {
                              y: -2,
                              scale: 1.01,
                              transition: BUTTON_SPRING,
                            }
                      }
                      whileTap={
                        isLoading
                          ? undefined
                          : {
                              scale: 0.98,
                            }
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950"
                            aria-hidden="true"
                          />

                          <span>
                            Sending OTP...
                          </span>

                          <span className="sr-only">
                            Sending reset OTP in progress
                          </span>
                        </>
                      ) : (
                        <>
                          Send Reset OTP

                          <span
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}

                {/* =================================================
                    STEP 2 — OTP
                ================================================== */}

                {step === 2 && (
                  <form
                    onSubmit={handleOtpSubmit}
                    className="mt-7 space-y-5"
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="reset-otp"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Reset OTP
                      </label>

                      <motion.input
                        whileFocus={{
                          scale: 1.01,
                          transition: CARD_SPRING,
                        }}
                        id="reset-otp"
                        name="otp"
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
                        aria-required="true"
                        aria-invalid={Boolean(
                          error && otp.length > 0
                        )}
                        aria-describedby={
                          error
                            ? "forgot-error reset-otp-hint"
                            : success
                            ? "forgot-success reset-otp-hint"
                            : "reset-otp-hint"
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-center text-lg font-semibold tracking-[0.35em] text-white outline-none transition-all duration-200 placeholder:text-neutral-700 placeholder:tracking-normal focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />

                      <p
                        id="reset-otp-hint"
                        className="sr-only"
                      >
                        Enter the 6-digit reset code sent to
                        your registered email address.
                      </p>
                    </div>

                    <p className="text-center text-xs leading-5 text-neutral-700">
                      Reset code sent to{" "}
                      <span className="text-neutral-500">
                        {email}
                      </span>
                    </p>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      aria-disabled={isLoading}
                      aria-busy={isLoading}
                      whileHover={
                        isLoading
                          ? undefined
                          : {
                              y: -2,
                              scale: 1.01,
                              transition: BUTTON_SPRING,
                            }
                      }
                      whileTap={
                        isLoading
                          ? undefined
                          : {
                              scale: 0.98,
                            }
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950"
                            aria-hidden="true"
                          />

                          <span>
                            Verifying...
                          </span>

                          <span className="sr-only">
                            OTP verification in progress
                          </span>
                        </>
                      ) : (
                        <>
                          Verify OTP

                          <span
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </>
                      )}
                    </motion.button>

                    {/* Resend OTP */}

                    <div
                      className="flex items-center justify-center gap-2 text-xs"
                      aria-live="polite"
                    >
                      <span className="text-neutral-700">
                        Didn't receive the code?
                      </span>

                      <motion.button
                        type="button"
                        onClick={handleResendOtp}
                        aria-disabled={
                          isLoading ||
                          resendCooldown > 0
                        }
                        aria-busy={isLoading}
                        whileHover={
                          isLoading || resendCooldown > 0
                            ? undefined
                            : {
                                y: -1,
                                transition: BUTTON_SPRING,
                              }
                        }
                        whileTap={
                          isLoading || resendCooldown > 0
                            ? undefined
                            : {
                                scale: 0.97,
                              }
                        }
                        disabled={
                          isLoading ||
                          resendCooldown > 0
                        }
                        className="font-medium text-amber-300/70 transition-colors hover:text-amber-300 disabled:cursor-not-allowed disabled:text-neutral-700"
                      >
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend OTP"}
                      </motion.button>
                    </div>
                  </form>
                )}

                {/* =================================================
                    STEP 3 — NEW PASSWORD
                ================================================== */}

                {step === 3 && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="mt-7 space-y-5"
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        New Password
                      </label>

                      <motion.input
                        whileFocus={{
                          scale: 1.01,
                          transition: CARD_SPRING,
                        }}
                        id="new-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        placeholder="Create a new password"
                        required
                        minLength={6}
                        aria-required="true"
                        aria-invalid={Boolean(
                          error &&
                            passwordData.password.length > 0
                        )}
                        aria-describedby={
                          error
                            ? "forgot-error new-password-hint"
                            : success
                            ? "forgot-success new-password-hint"
                            : "new-password-hint"
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />

                      <p
                        id="new-password-hint"
                        className="mt-2 text-[11px] text-neutral-700"
                      >
                        Use at least 6 characters.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-new-password"
                        className="mb-2 block text-sm font-medium text-neutral-300"
                      >
                        Confirm New Password
                      </label>

                      <motion.input
                        whileFocus={{
                          scale: 1.01,
                          transition: CARD_SPRING,
                        }}
                        id="confirm-new-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={
                          passwordData.confirmPassword
                        }
                        onChange={handlePasswordChange}
                        placeholder="Enter the password again"
                        required
                        minLength={6}
                        aria-required="true"
                        aria-invalid={Boolean(
                          error &&
                            passwordData.confirmPassword
                              .length > 0
                        )}
                        aria-describedby={
                          error
                            ? "forgot-error confirm-password-hint"
                            : success
                            ? "forgot-success confirm-password-hint"
                            : "confirm-password-hint"
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-700 focus:border-amber-300/40 focus:bg-black/40 focus:ring-2 focus:ring-amber-300/10"
                      />

                      <p
                        id="confirm-password-hint"
                        className="sr-only"
                      >
                        Re-enter the same password to confirm
                        your new password.
                      </p>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      aria-disabled={isLoading}
                      aria-busy={isLoading}
                      whileHover={
                        isLoading
                          ? undefined
                          : {
                              y: -2,
                              scale: 1.01,
                              transition: BUTTON_SPRING,
                            }
                      }
                      whileTap={
                        isLoading
                          ? undefined
                          : {
                              scale: 0.98,
                            }
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950"
                            aria-hidden="true"
                          />

                          <span>
                            Resetting Password...
                          </span>

                          <span className="sr-only">
                            Password reset in progress
                          </span>
                        </>
                      ) : (
                        <>
                          Reset Password

                          <span
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </>
                      )}
                    </motion.button>
                  </form>
                )}

                {/* Back to Login */}

                <motion.button
                  type="button"
                  onClick={goBackToLogin}
                  aria-label="Back to Login"
                  whileHover={{
                    y: -1,
                    transition: BUTTON_SPRING,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 text-xs text-neutral-600 transition-colors hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                >
                  <span aria-hidden="true">←</span>
                  Back to Login
                </motion.button>

                {/* Login link */}

                <p className="mt-5 text-center text-[11px] leading-5 text-neutral-700">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="rpg-link text-amber-300/60 transition-colors hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
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