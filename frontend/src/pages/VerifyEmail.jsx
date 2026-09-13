import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL = "https://zephyr-1-8h6x.onrender.com/";

const RESEND_COOLDOWN_SECONDS = 60;
const RESEND_COOLDOWN_STORAGE_KEY =
  "verification_resend_available_at";

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

  const getInitialResendCooldown = () => {
    const availableAt = Number(
      localStorage.getItem(RESEND_COOLDOWN_STORAGE_KEY)
    );

    if (!availableAt) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil((availableAt - Date.now()) / 1000)
    );
  };

  const [resendCooldown, setResendCooldown] = useState(
    getInitialResendCooldown
  );

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!location.state?.email) {
        const pendingEmail = localStorage.getItem(
          "pending_signup_email"
        );

        if (pendingEmail) {
          setEmail(pendingEmail);
        }
      }

      const availableAt = Number(
        localStorage.getItem(RESEND_COOLDOWN_STORAGE_KEY)
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
      } else {
        setResendCooldown(0);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state]);

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

  const isVerifyDisabled =
    isVerifying || isResending;

  const isResendDisabled =
    resendCooldown > 0 ||
    isVerifying ||
    isResending;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{
            opacity: [0.18, 0.28, 0.18],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[120px]"
        />

        <motion.div
          animate={{
            opacity: [0.08, 0.16, 0.08],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-[-180px] right-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-300/10 blur-[110px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
            ease: AUTH_EASE,
          }}
          className="w-full"
        >
          {/* Back to signup */}
          <div className="mb-5">
            <Link
              to="/signup"
              aria-label="Back to Signup"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              Back to Signup
            </Link>
          </div>

          {/* Card */}
          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              ...SPRING,
              delay: 0.08,
            }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8"
          >
            {/* Header icon */}
            <div className="mb-6 flex justify-center">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  rotate: -8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  ...SPRING,
                  delay: 0.16,
                }}
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-300 shadow-lg shadow-amber-500/5"
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="h-7 w-7"
                />
              </motion.div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-300/80">
                <Mail
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
                Account Verification
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Verify Your Email
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-400">
                Enter the 6-digit verification code
                sent to your email address.
              </p>
            </div>

            {/* Verification form */}
            <form
              onSubmit={handleVerify}
              noValidate
              className="mt-7"
            >
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-neutral-200"
                >
                  Verification Code
                </label>

                <div className="relative">
                  <KeyRound
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                  />

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isVerifying}
                    aria-required="true"
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? "otp-hint verify-error"
                        : "otp-hint"
                    }
                    placeholder="Enter 6-digit code"
                    className="w-full rounded-xl border border-white/[0.09] bg-black/20 py-3 pl-10 pr-4 text-center text-lg font-medium tracking-[0.35em] text-white placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-600 outline-none transition-all duration-200 focus:border-amber-300/40 focus:bg-black/30 focus:ring-2 focus:ring-amber-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <p
                  id="otp-hint"
                  className="mt-2 text-xs leading-5 text-neutral-500"
                >
                  Enter exactly 6 digits from the
                  verification email.
                </p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: AUTH_EASE,
                  }}
                  id="verify-error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm leading-5 text-red-300"
                >
                  {error}
                </motion.div>
              )}

              {/* Success */}
              {message && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: AUTH_EASE,
                  }}
                  id="verify-message"
                  role="status"
                  aria-live="polite"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm leading-5 text-emerald-300"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  <span>{message}</span>
                </motion.div>
              )}

              {/* Verify button */}
              <motion.button
                type="submit"
                whileHover={
                  isVerifyDisabled
                    ? undefined
                    : { y: -1 }
                }
                whileTap={
                  isVerifyDisabled
                    ? undefined
                    : { scale: 0.985 }
                }
                transition={BUTTON_SPRING}
                disabled={isVerifyDisabled}
                aria-disabled={isVerifyDisabled}
                aria-busy={isVerifying}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/10 transition-all duration-200 hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                    <span>Verifying...</span>
                    <span className="sr-only">
                      Email verification in progress
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                    <span>Verify Email</span>
                  </>
                )}
              </motion.button>

              {/* Resend */}
              <div className="mt-5 text-center">
                <p className="text-xs text-neutral-500">
                  Didn&apos;t receive the code?
                </p>

                <motion.button
                  type="button"
                  whileHover={
                    isResendDisabled
                      ? undefined
                      : { y: -1 }
                  }
                  whileTap={
                    isResendDisabled
                      ? undefined
                      : { scale: 0.97 }
                  }
                  transition={BUTTON_SPRING}
                  onClick={handleResend}
                  disabled={isResendDisabled}
                  aria-disabled={isResendDisabled}
                  aria-busy={isResending}
                  aria-label={
                    isResending
                      ? "Sending a new verification code"
                      : resendCooldown > 0
                      ? `Resend verification code available in ${resendCooldown} seconds`
                      : "Resend verification code"
                  }
                  className={`mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3 ${
                    resendCooldown > 0
                      ? "cursor-not-allowed text-neutral-600"
                      : "text-amber-300 hover:bg-amber-300/[0.06] hover:text-amber-200"
                  } disabled:opacity-50`}
                >
                  <RefreshCw
                    aria-hidden="true"
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
                </motion.button>
              </div>
            </form>

            {/* Login link */}
            <div className="mt-7 border-t border-white/[0.06] pt-5 text-center">
              <p className="text-sm text-neutral-500">
                Already verified?
              </p>

              <Link
                to="/login"
                className="mt-1 inline-flex rounded-lg px-2 py-1 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-300/[0.05] hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3"
              >
                Go to Login
              </Link>
            </div>
          </motion.section>

          {/* Footer hint */}
          <p className="mt-5 text-center text-xs leading-5 text-neutral-600">
            Your verification code helps keep your
            account secure.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default VerifyEmail;