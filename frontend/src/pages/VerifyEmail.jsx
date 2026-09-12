import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_STORAGE_KEY = "verification_resend_available_at";

const AUTH_EASE = [0.22, 1, 0.36, 1];

const SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 22,
};

const BUTTON_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 24,
};

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /*
   * Recover email and existing resend cooldown.
   */
  useEffect(() => {
    if (!location.state?.email) {
      const pendingEmail = localStorage.getItem(
        "pending_signup_email"
      );

      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }

    const availableAt = Number(
      localStorage.getItem(
        RESEND_COOLDOWN_STORAGE_KEY
      )
    );

    if (availableAt) {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((availableAt - Date.now()) / 1000)
      );

      setResendCooldown(remainingSeconds);

      if (remainingSeconds === 0) {
        localStorage.removeItem(
          RESEND_COOLDOWN_STORAGE_KEY
        );
      }
    }
  }, [location.state]);

  /*
   * Resend OTP countdown.
   */
  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          localStorage.removeItem(
            RESEND_COOLDOWN_STORAGE_KEY
          );

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const startResendCooldown = () => {
    const availableAt =
      Date.now() +
      RESEND_COOLDOWN_SECONDS * 1000;

    localStorage.setItem(
      RESEND_COOLDOWN_STORAGE_KEY,
      String(availableAt)
    );

    setResendCooldown(
      RESEND_COOLDOWN_SECONDS
    );
  };

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
    setMessage("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Signup email was not found. Please create your account again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setIsVerifying(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Email verification failed."
        );
      }

      localStorage.removeItem(
        "pending_signup_email"
      );

      localStorage.removeItem(
        RESEND_COOLDOWN_STORAGE_KEY
      );

      setResendCooldown(0);

      setMessage(
        data.message ||
          "Email verified successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", {
          state: {
            email,
            message:
              "Email verified successfully. You can now log in.",
          },
        });
      }, 900);
    } catch (error) {
      console.error(
        "Email verification error:",
        error
      );

      setError(
        error?.message ||
          "Unable to verify your email. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (
      resendCooldown > 0 ||
      isResending ||
      isVerifying
    ) {
      return;
    }

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Signup email was not found. Please create your account again."
      );
      return;
    }

    try {
      setIsResending(true);

      const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to resend verification code."
        );
      }

      setOtp("");

      startResendCooldown();

      setMessage(
        data.message ||
          "A new verification code has been sent to your email."
      );
    } catch (error) {
      console.error(
        "Resend verification OTP error:",
        error
      );

      setError(
        error?.message ||
          "Unable to resend the verification code."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/[0.06] blur-[110px]" />

        <div className="absolute -left-40 bottom-[-160px] h-[360px] w-[360px] rounded-full bg-amber-500/[0.035] blur-[100px]" />

        <div className="absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-white/[0.025] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Top navigation */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: AUTH_EASE }}
        >
          <Link
            to="/signup"
            className="rpg-interactive inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2.5 text-sm font-medium text-neutral-300 backdrop-blur-xl hover:border-neutral-700 hover:text-white"
          >
            <motion.span
              whileHover={{ x: -3 }}
              transition={BUTTON_SPRING}
              className="inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.span>
            Back to Signup
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: AUTH_EASE }}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
        >
          <motion.span
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
          </motion.span>
          Secure Verification
        </motion.div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: AUTH_EASE,
          }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={SPRING}
            className="rpg-card rounded-3xl border border-neutral-800/90 bg-neutral-950/85 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.06, rotate: 4 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
                className="rpg-glow flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/[0.07]"
              >
                <Mail className="h-7 w-7 text-amber-300" />
              </motion.div>
            </div>

            {/* Heading */}
            <div className="mt-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                Account Verification
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Verify your email
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-400">
                We sent a 6-digit verification code to
              </p>

              <p className="mt-1 break-all text-sm font-medium text-neutral-200">
                {email || "your email address"}
              </p>
            </div>

            {/* Verification form */}
            <form
              onSubmit={handleVerify}
              className="mt-8"
            >
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-neutral-200"
              >
                Verification code
              </label>

              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />

                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  aria-describedby={
                    error
                      ? "verify-error"
                      : message
                      ? "verify-message"
                      : undefined
                  }
                  className="h-14 w-full rounded-xl border border-neutral-800 bg-neutral-900/80 pl-12 pr-4 text-center text-lg font-semibold tracking-[0.35em] text-white placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-600 outline-none transition-all duration-200 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/10"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  id="verify-error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm leading-5 text-red-300"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              {/* Success */}
              {message && (
                <motion.p
                  id="verify-message"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-sm leading-5 text-emerald-300"
                  role="status"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </motion.p>
              )}

              {/* Verify */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={BUTTON_SPRING}
              >
                <button
                  type="submit"
                  disabled={
                    isVerifying || isResending
                  }
                  className="rpg-button mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-amber-300 px-5 text-sm font-semibold text-neutral-950 shadow-lg shadow-amber-300/10 transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
                </button>
              </motion.div>
            </form>

            {/* Resend */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
                Didn't receive the code?
              </p>

              <motion.div
                whileHover={resendCooldown > 0 ? undefined : { y: -1 }}
                whileTap={resendCooldown > 0 ? undefined : { scale: 0.97 }}
                transition={BUTTON_SPRING}
                className="inline-flex"
              >
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    resendCooldown > 0 ||
                    isVerifying ||
                    isResending
                  }
                  className={`mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  resendCooldown > 0
                    ? "cursor-not-allowed text-neutral-600"
                    : "text-amber-300 hover:bg-amber-300/[0.06] hover:text-amber-200"
                } disabled:opacity-50`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isResending
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend verification code"}
                </button>
              </motion.div>
            </div>

            {/* Login */}
            <div className="mt-7 border-t border-neutral-800/80 pt-6 text-center">
              <p className="text-sm text-neutral-500">
                Already verified?
              </p>

              <motion.div
                whileHover={{ y: -1 }}
                transition={BUTTON_SPRING}
                className="inline-block"
              >
                <Link
                  to="/login"
                  className="mt-2 inline-block text-sm font-semibold text-neutral-200 transition-colors hover:text-amber-300"
                >
                  Go to Login
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer hint */}
          <p className="mt-5 text-center text-xs leading-5 text-neutral-600">
            Your verification code is temporary and should
            never be shared with anyone.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default VerifyEmail;