import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:5000/api";

const ATTRIBUTE_CONFIG = [
  {
    key: "strength",
    short: "STR",
    label: "Strength",
    description: "Physical power and active energy.",
    icon: "✦",
  },
  {
    key: "intellect",
    short: "INT",
    label: "Intellect",
    description: "Knowledge, learning and mental growth.",
    icon: "◈",
  },
  {
    key: "discipline",
    short: "DIS",
    label: "Discipline",
    description: "Consistency, planning and self-control.",
    icon: "◆",
  },
  {
    key: "vitality",
    short: "VIT",
    label: "Vitality",
    description: "Fitness, wellbeing and daily energy.",
    icon: "◇",
  },
];

function getXPRequiredForLevel(level) {
  if (level <= 1) return 0;

  return 50 * level * (level - 1);
}

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your profile"
        );
      }

      setUser(result.data.user);
    } catch (err) {
      console.error("Profile error:", err);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token"
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to load your profile");
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;

  const currentLevelXP = getXPRequiredForLevel(currentLevel);
  const nextLevelXP = getXPRequiredForLevel(currentLevel + 1);

  const xpRange = nextLevelXP - currentLevelXP;

  const xpIntoLevel = Math.max(
    0,
    currentXp - currentLevelXP
  );

  const levelProgress =
    xpRange > 0
      ? Math.min(
          100,
          Math.round((xpIntoLevel / xpRange) * 100)
        )
      : 0;

  const attributes = user?.attributes || {
    strength: 0,
    intellect: 0,
    discipline: 0,
    vitality: 0,
  };

  const streak = user?.streak || {
    current: 0,
    longest: 0,
  };

  const inventory = user?.inventory || [];

  const initials =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 rounded-3xl bg-white/[0.04]" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>

            <div className="h-80 rounded-3xl bg-white/[0.03]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-red-400/20 bg-red-400/[0.05] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
              !
            </div>

            <h1 className="mt-4 text-xl font-semibold">
              Unable to load profile
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {error || "Your profile could not be loaded."}
            </p>

            <button
              type="button"
              onClick={fetchProfile}
              className="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200"
            >
              Try Again
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* PAGE HEADER */}
          <section className="mb-8">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/80">
              Character Profile
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Adventurer Sheet
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Everything you've built through your real-world quests,
              gathered in one place.
            </p>
          </section>

          {/* CHARACTER HERO */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/[0.08] text-4xl font-bold text-amber-200 shadow-[0_0_45px_rgba(252,211,77,0.08)]">
                    {initials}

                    <div className="absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-xl border border-neutral-900 bg-amber-300 px-2 text-xs font-bold text-neutral-950">
                      {currentLevel}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/70">
                      Adventurer
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                      {user.name || "Adventurer"}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  to="/tasks"
                  className="inline-flex w-fit items-center justify-center rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Continue Questing →
                </Link>
              </div>

              {/* LEVEL */}
              <div className="mt-8 border-t border-white/5 pt-7">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
                      Current Level
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        Level {currentLevel}
                      </span>

                      <span className="text-sm text-neutral-600">
                        {currentXp} XP
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-amber-200">
                    {Math.max(
                      0,
                      nextLevelXP - currentXp
                    )}{" "}
                    XP to Level {currentLevel + 1}
                  </p>
                </div>

                <div
                  className="mt-4 h-3 overflow-hidden rounded-full bg-neutral-900"
                  role="progressbar"
                  aria-valuenow={levelProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Level progress: ${levelProgress}%`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${levelProgress}%`,
                    }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                    }}
                    className="relative h-full rounded-full bg-amber-300"
                  >
                    <div className="absolute right-0 top-0 h-full w-14 bg-white/30 blur-sm" />
                  </motion.div>
                </div>

                <div className="mt-2 flex justify-between text-xs text-neutral-600">
                  <span>
                    {currentLevelXP} XP
                  </span>

                  <span className="text-amber-300/70">
                    {levelProgress}% complete
                  </span>

                  <span>
                    {nextLevelXP} XP
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* OVERVIEW STATS */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <ProfileStat
              label="Level"
              value={currentLevel}
              suffix="current"
              icon="LVL"
            />

            <ProfileStat
              label="Total XP"
              value={currentXp}
              suffix="earned"
              icon="XP"
            />

            <ProfileStat
              label="Currency"
              value={user.currency || 0}
              suffix="coins"
              icon="◈"
            />

            <ProfileStat
              label="Current Streak"
              value={streak.current || 0}
              suffix="days"
              icon="🔥"
            />
          </section>

          {/* CHARACTER ATTRIBUTES */}
          <section className="mb-8">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                Character Build
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Attributes
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                The stats you've developed through your quests.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ATTRIBUTE_CONFIG.map((attribute, index) => {
                const value = attributes[attribute.key] || 0;

                const progress = Math.min(
                  100,
                  value * 10
                );

                return (
                  <motion.article
                    key={attribute.key}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.06,
                    }}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-300/20 hover:bg-white/[0.045] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/5 text-amber-200">
                          {attribute.icon}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold tracking-[0.18em] text-amber-300/60">
                            {attribute.short}
                          </p>

                          <h3 className="mt-0.5 font-semibold">
                            {attribute.label}
                          </h3>
                        </div>
                      </div>

                      <span className="text-3xl font-bold">
                        {value}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-neutral-500">
                      {attribute.description}
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-neutral-600">
                          Growth
                        </span>

                        <span className="text-amber-300/70">
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="h-2 overflow-hidden rounded-full bg-neutral-900"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${attribute.label} growth: ${progress}%`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.7,
                            delay: index * 0.06,
                          }}
                          className="h-full rounded-full bg-amber-300"
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* STREAK + PERSONAL BEST */}
          <section className="mb-8 grid gap-4 lg:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.04] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300/60">
                    Consistency
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Current Streak
                  </h2>
                </div>

                <span className="text-2xl">
                  🔥
                </span>
              </div>

              <div className="mt-7 flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {streak.current || 0}
                </span>

                <span className="text-sm text-neutral-500">
                  days
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Keep completing quests on consecutive days to
                maintain your momentum.
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                    Personal Best
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Longest Streak
                  </h2>
                </div>

                <span className="text-2xl">
                  🏆
                </span>
              </div>

              <div className="mt-7 flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {streak.longest || 0}
                </span>

                <span className="text-sm text-neutral-500">
                  days
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Your longest consecutive run since starting your
                journey.
              </p>
            </motion.article>
          </section>

          {/* INVENTORY */}
          <section className="mb-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Collection
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Inventory
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Rewards you've unlocked through your journey.
                </p>
              </div>

              <Link
                to="/rewards"
                className="text-sm font-medium text-amber-300 transition hover:text-amber-200"
              >
                Visit Reward Shop →
              </Link>
            </div>

            {inventory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-xl text-amber-200">
                  ◈
                </div>

                <h3 className="mt-5 font-semibold">
                  Your inventory is empty
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                  Complete quests, earn currency and unlock your
                  first reward.
                </p>

                <Link
                  to="/rewards"
                  className="mt-5 inline-flex rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200"
                >
                  Explore Rewards
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inventory.map((entry, index) => {
                  const reward =
                    typeof entry.reward === "object"
                      ? entry.reward
                      : null;

                  const rewardName =
                    reward?.name || "Reward";

                  const rewardDescription =
                    reward?.description ||
                    "An unlocked reward from your journey.";

                  const rewardType =
                    reward?.type || "item";

                  return (
                    <motion.article
                      key={
                        reward?._id ||
                        entry._id ||
                        index
                      }
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                      }}
                      className="overflow-hidden rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.025]"
                    >
                      <div className="flex h-32 items-center justify-center border-b border-white/5 bg-gradient-to-br from-emerald-300/[0.05] to-transparent">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/5 text-2xl text-emerald-300">
                          {getInventoryIcon(rewardType)}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-neutral-100">
                            {rewardName}
                          </h3>

                          <span className="shrink-0 rounded-lg border border-emerald-300/15 bg-emerald-300/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                            {rewardType}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {rewardDescription}
                        </p>

                        <div className="mt-4 border-t border-white/5 pt-3">
                          <span className="text-xs text-emerald-300/70">
                            ✓ Unlocked
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ACCOUNT SUMMARY */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                  Character Summary
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Keep building your character.
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Every quest contributes to your progression.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SummaryItem
                  label="Attributes"
                  value={
                    Object.values(attributes).reduce(
                      (total, value) =>
                        total + (value || 0),
                      0
                    )
                  }
                />

                <SummaryItem
                  label="Rewards"
                  value={inventory.length}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileStat({ label, value, suffix, icon }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-300/20 hover:bg-white/[0.045]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          {label}
        </p>

        <span className="text-xs font-bold text-amber-300/60">
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">
          {value}
        </span>

        <span className="text-xs text-neutral-600">
          {suffix}
        </span>
      </div>
    </motion.article>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-center">
      <p className="text-lg font-semibold text-neutral-200">
        {value}
      </p>

      <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
    </div>
  );
}

function getInventoryIcon(type) {
  if (type === "theme") {
    return "◉";
  }

  if (type === "badge") {
    return "◆";
  }

  return "✦";
}

export default Profile;