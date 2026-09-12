import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const DASHBOARD_EASE = [0.22, 1, 0.36, 1];

const dashboardReveal = {
  hidden: {
    opacity: 0,
    y: 42,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: DASHBOARD_EASE,
    },
  },
};

const dashboardRevealFast = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.58,
      ease: DASHBOARD_EASE,
    },
  },
};

const LEADERBOARD_METRICS = [
  { value: "xp", label: "XP" },
  { value: "level", label: "Level" },
  { value: "currentStreak", label: "Current Streak" },
  { value: "longestStreak", label: "Longest Streak" },
  { value: "strength", label: "Strength" },
  { value: "intellect", label: "Intellect" },
  { value: "discipline", label: "Discipline" },
  { value: "vitality", label: "Vitality" },
];

const LEADERBOARD_LIMITS = [3, 10, 100];

const ATTRIBUTE_CONFIG = [
  {
    key: "strength",
    label: "Strength",
    short: "STR",
    description: "Physical power and active energy.",
    categories: ["gym"],
    icon: "✦",
  },
  {
    key: "intellect",
    label: "Intellect",
    short: "INT",
    description: "Knowledge, learning and mental growth.",
    categories: ["coding", "learning"],
    icon: "◈",
  },
  {
    key: "discipline",
    label: "Discipline",
    short: "DIS",
    description: "Consistency, planning and self-control.",
    categories: ["discipline", "planning"],
    icon: "◆",
  },
  {
    key: "vitality",
    label: "Vitality",
    short: "VIT",
    description: "Fitness, wellbeing and daily energy.",
    categories: ["fitness"],
    icon: "◇",
  },
];

function getXPRequiredForLevel(level) {
  if (level <= 1) return 0;

  return 50 * level * (level - 1);
}

function getStreakMessage(currentStreak) {
  if (currentStreak === 0) {
    return {
      title: "Start your streak",
      description:
        "Complete a quest to begin building your daily momentum.",
    };
  }

  if (currentStreak === 1) {
    return {
      title: "The journey begins",
      description:
        "You've completed today. Come back tomorrow to extend your streak.",
    };
  }

  if (currentStreak < 7) {
    return {
      title: "Momentum is building",
      description:
        "Keep completing quests on consecutive days to grow your streak.",
    };
  }

  if (currentStreak < 30) {
    return {
      title: "You're on a roll",
      description:
        "Your consistency is becoming part of your character.",
    };
  }

  return {
    title: "Elite consistency",
    description:
      "You've built an impressive streak. Keep the momentum alive.",
  };
}

function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    token,
    refreshUser,
  } = useAuth();

  const [tasks, setTasks] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  const [leaderboardMetric, setLeaderboardMetric] = useState("xp");
  const [leaderboardLimit, setLeaderboardLimit] = useState(10);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [tasksError, setTasksError] = useState("");
  const [leaderboardError, setLeaderboardError] = useState("");

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    fetchTasks();
  }, [authLoading, token, user, navigate]);

  useEffect(() => {
    if (!token) return;

    fetchLeaderboard();
  }, [token, leaderboardMetric, leaderboardLimit]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      setTasksError("");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "GET",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load quests");
      }

      setTasks(result.data.tasks || []);
    } catch (error) {
      console.error("Dashboard tasks error:", error);

      if (
        error.message === "Token expired" ||
        error.message === "Invalid token"
      ) {
        await refreshUser();
        return;
      }

      setTasksError(error.message || "Unable to load quests");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      setLeaderboardError("");

      const response = await fetch(
        `${API_BASE_URL}/leaderboard?metric=${leaderboardMetric}&limit=${leaderboardLimit}`,
        {
          method: "GET",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load leaderboard");
      }

      setLeaderboard(result.data.leaderboard || []);
      setCurrentUserRank(result.data.currentUserRank ?? null);
    } catch (error) {
      console.error("Dashboard leaderboard error:", error);

      if (
        error.message === "Token expired" ||
        error.message === "Invalid token"
      ) {
        await refreshUser();
        return;
      }

      setLeaderboardError(
        error.message || "Unable to load leaderboard"
      );
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const taskProgress =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;

  const currentLevelXP = getXPRequiredForLevel(currentLevel);
  const nextLevelXP = getXPRequiredForLevel(
    currentLevel + 1
  );

  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  const xpIntoCurrentLevel = Math.max(
    0,
    currentXp - currentLevelXP
  );

  const levelProgress =
    xpNeededForLevel > 0
      ? Math.min(
          100,
          Math.round(
            (xpIntoCurrentLevel / xpNeededForLevel) * 100
          )
        )
      : 0;

  const remainingXp = Math.max(
    0,
    nextLevelXP - currentXp
  );

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

  const currentStreak = streak.current || 0;
  const longestStreak = streak.longest || 0;

  const streakMessage = getStreakMessage(currentStreak);

  const streakMilestones = [1, 3, 7, 14, 30];

  const nextStreakMilestone =
    streakMilestones.find(
      (milestone) => milestone > currentStreak
    ) || null;

  const previousStreakMilestone =
    [...streakMilestones]
      .reverse()
      .find(
        (milestone) => milestone <= currentStreak
      ) || 0;

  const streakRange =
    nextStreakMilestone !== null
      ? nextStreakMilestone -
        previousStreakMilestone
      : 30 - previousStreakMilestone;

  const streakProgress =
    nextStreakMilestone !== null
      ? Math.min(
          100,
          Math.round(
            ((currentStreak -
              previousStreakMilestone) /
              Math.max(1, streakRange)) *
              100
          )
        )
      : 100;

  const selectedMetricLabel =
    LEADERBOARD_METRICS.find(
      (metric) =>
        metric.value === leaderboardMetric
    )?.label || "XP";

  const getMetricDisplayValue = (player) => {
    if (leaderboardMetric === "xp") {
      return `${player.metricValue} XP`;
    }

    if (leaderboardMetric === "level") {
      return `Level ${player.metricValue}`;
    }

    if (
      leaderboardMetric === "currentStreak" ||
      leaderboardMetric === "longestStreak"
    ) {
      return `${player.metricValue} days`;
    }

    return player.metricValue;
  };

  return (
    <main
      className="min-h-screen bg-neutral-950 text-white"
      aria-labelledby="dashboard-title"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* PAGE INTRO */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={dashboardRevealFast}
            className="mb-8"
          >
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/80">
              Adventurer Dashboard
            </p>

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1
                  id="dashboard-title"
                  className="text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  Welcome back
                  {user?.name
                    ? `, ${user.name}`
                    : ""}
                  .
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                  Your everyday progress is building your character.
                  Keep completing quests and keep moving forward.
                </p>
              </div>

              <Link
                to="/tasks"
                className="inline-flex w-fit items-center justify-center rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                View Quests
                <span className="ml-2">→</span>
              </Link>
            </div>
          </motion.section>

          {/* CHARACTER PROGRESSION */}
          {authLoading && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={dashboardReveal}
              className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
            >
              <div className="animate-pulse space-y-5">
                <div className="h-4 w-40 rounded bg-white/10" />

                <div className="h-8 w-64 rounded bg-white/10" />

                <div className="h-3 w-full rounded bg-white/10" />

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="h-20 rounded-2xl bg-white/5" />
                  <div className="h-20 rounded-2xl bg-white/5" />
                  <div className="h-20 rounded-2xl bg-white/5" />
                </div>
              </div>
            </motion.section>
          )}

          {tasksError && !loadingTasks && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={dashboardReveal}
              className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/5 p-5"
            >
              <p
                className="text-sm text-red-300"
                role="alert"
                aria-live="assertive"
              >
                {tasksError}
              </p>

              <button
                type="button"
                onClick={fetchTasks}
                className="mt-3 rounded-md text-sm font-medium text-amber-300 transition hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3"
              >
                Try again →
              </button>
            </motion.section>
          )}

          {!authLoading && user && (
            <motion.section
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
              }}
              className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-2xl font-bold text-amber-200"
                    >
                      {user?.name
                        ?.trim()
                        ?.charAt(0)
                        ?.toUpperCase() || "A"}
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/70">
                        Character Progression
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold">
                        {user.name ||
                          "Adventurer"}
                      </h2>

                      <p className="mt-1 text-sm text-neutral-500">
                        Your journey is becoming your character.
                      </p>
                    </div>
                  </div>

                  <div className="flex w-fit items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-3">
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10"
                    >
                      <span aria-hidden="true" className="text-sm font-bold text-amber-200">
                        {String(
                          currentLevel
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-amber-300/60">
                        Current
                      </p>

                      <p className="text-sm font-semibold text-white">
                        Level {currentLevel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500">
                        Level Progress
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {currentXp} XP

                        <span className="ml-2 text-sm font-normal text-neutral-600">
                          total earned
                        </span>
                      </p>
                    </div>

                    <p className="text-sm text-amber-200">
                      {remainingXp} XP to Level{" "}
                      {currentLevel + 1}
                    </p>
                  </div>

                  <div
                    className="relative h-4 overflow-hidden rounded-full border border-white/5 bg-neutral-900"
                    role="progressbar"
                    aria-valuenow={
                      levelProgress
                    }
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Level ${currentLevel} progress: ${levelProgress}%`}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${levelProgress}%`,
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className="relative h-full rounded-full bg-amber-300"
                    >
                      <div className="absolute inset-y-0 right-0 w-16 bg-white/30 blur-md" />
                    </motion.div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-600">
                    <span>
                      Level {currentLevel}
                    </span>

                    <span className="font-medium text-amber-300/70">
                      {levelProgress}% complete
                    </span>

                    <span>
                      Level {currentLevel + 1}
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <ProgressInfo
                    label="XP Earned"
                    value={`${currentXp}`}
                    description="Total character XP"
                  />

                  <ProgressInfo
                    label="Current Level"
                    value={`${currentLevel}`}
                    description="Your present rank"
                  />

                  <ProgressInfo
                    label="Next Level"
                    value={`${nextLevelXP} XP`}
                    description={`${remainingXp} XP remaining`}
                  />
                </div>
              </div>
            </motion.section>
          )}

          {/* QUICK CHARACTER STATS */}
          {!authLoading && user && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
              variants={dashboardReveal}
              className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
              <StatCard
                label="Currency"
                value={user.currency || 0}
                suffix="coins"
                icon="◈"
              />

              <StatCard
                label="Current Streak"
                value={currentStreak}
                suffix="days"
                icon="🔥"
              />

              <StatCard
                label="Longest Streak"
                value={longestStreak}
                suffix="days"
                icon="↗"
              />

              <StatCard
                label="Quest Progress"
                value={completedTasks}
                suffix={`/${totalTasks} done`}
                icon="✓"
              />
            </motion.section>
          )}

          {/* ATTRIBUTES */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={dashboardReveal}
            className="mb-8"
          >
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Character Build
                </p>

                <h2
                  id="attributes-title"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  Attributes
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Every kind of quest develops a different part of your
                  character.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Built through completed quests
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ATTRIBUTE_CONFIG.map(
                (attribute, index) => {
                  const value =
                    attributes[
                      attribute.key
                    ] || 0;

                  const attributeProgress =
                    Math.min(100, value * 10);

                  const relatedTasks =
                    tasks.filter((task) =>
                      attribute.categories.includes(
                        task.category
                      )
                    );

                  const completedRelatedTasks =
                    relatedTasks.filter(
                      (task) => task.completed
                    ).length;

                  return (
                    <motion.article
                      key={attribute.key}
                      initial={{
                        opacity: 0,
                        y: 18,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.07,
                      }}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-amber-300/20 hover:bg-white/[0.045] sm:p-6"
                    >
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-300/5 blur-3xl transition duration-500 group-hover:bg-amber-300/10" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div
                              aria-hidden="true"
                              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-lg text-amber-200"
                            >
                              {attribute.icon}
                            </div>

                            <div>
                              <p className="text-[11px] font-bold tracking-[0.18em] text-amber-300/60">
                                {attribute.short}
                              </p>

                              <h3 className="mt-0.5 text-lg font-semibold">
                                {attribute.label}
                              </h3>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-bold tracking-tight text-white">
                              {value}
                            </p>

                            <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                              stat points
                            </p>
                          </div>
                        </div>

                        <p className="relative mt-5 max-w-md text-sm leading-6 text-neutral-500">
                          {attribute.description}
                        </p>

                        <div className="relative mt-6">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                              Character Growth
                            </span>

                            <span className="text-xs font-medium text-amber-300/70">
                              {attributeProgress}%
                            </span>
                          </div>

                          <div
                            className="h-2 overflow-hidden rounded-full bg-neutral-900"
                            role="progressbar"
                            aria-valuenow={
                              attributeProgress
                            }
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label={`${attribute.label} growth: ${attributeProgress}%`}
                          >
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${attributeProgress}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay:
                                  index * 0.07,
                                ease: "easeOut",
                              }}
                              className="relative h-full rounded-full bg-amber-300"
                            >
                              <div className="absolute right-0 top-0 h-full w-10 bg-white/30 blur-sm" />
                            </motion.div>
                          </div>
                        </div>

                        <div className="relative mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                              Quest Sources
                            </p>

                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {attribute.categories.map(
                                (category) => (
                                  <span
                                    key={
                                      category
                                    }
                                    className="rounded-lg border border-white/5 bg-black/20 px-2 py-1 text-[10px] capitalize text-neutral-500"
                                  >
                                    {category}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                              Completed
                            </p>

                            <p className="mt-1 text-sm font-semibold text-neutral-300">
                              {
                                completedRelatedTasks
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                }
              )}
            </div>
          </motion.section>

          {/* STREAK */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={dashboardReveal}
            className="mb-8"
          >
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                Consistency
              </p>

              <h2
                id="streak-title"
                className="mt-1 text-2xl font-semibold tracking-tight"
              >
                Streak
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Show up consistently and keep your momentum alive.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              {/* Current streak */}
              <motion.article
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="relative overflow-hidden rounded-3xl border border-amber-300/15 bg-amber-300/[0.04] p-6 sm:p-7"
              >
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-4">
                      <div
                        aria-hidden="true"
                        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-3xl"
                      >
                        🔥
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/60">
                          Current Streak
                        </p>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-4xl font-bold tracking-tight text-white">
                            {currentStreak}
                          </span>

                          <span className="text-sm text-neutral-500">
                            {currentStreak ===
                            1
                              ? "day"
                              : "days"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-neutral-500">
                      Daily consistency
                    </div>
                  </div>

                  <div className="mt-7">
                    <h3 className="text-base font-semibold text-neutral-200">
                      {streakMessage.title}
                    </h3>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
                      {streakMessage.description}
                    </p>
                  </div>

                  {/* Milestones */}
                  <div className="mt-7">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                        Streak Milestones
                      </span>

                      {nextStreakMilestone !==
                        null && (
                        <span className="text-xs text-amber-300/70">
                          {nextStreakMilestone -
                            currentStreak}{" "}
                          days to go
                        </span>
                      )}
                    </div>

                    <div
                      className="relative h-2 rounded-full bg-neutral-900"
                      role="progressbar"
                      aria-valuenow={
                        streakProgress
                      }
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`Streak milestone progress: ${streakProgress}%`}
                    >
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${streakProgress}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-amber-300"
                      />
                    </div>

                    <div className="mt-4 flex justify-between">
                      {streakMilestones.map(
                        (milestone) => {
                          const reached =
                            currentStreak >=
                            milestone;

                          return (
                            <div
                              key={milestone}
                              className="flex flex-col items-center gap-1.5"
                            >
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${
                                  reached
                                    ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                                    : "border-white/10 bg-white/[0.02] text-neutral-600"
                                }`}
                              >
                                {reached
                                  ? "✓"
                                  : milestone}
                              </span>

                              <span
                                className={`text-[10px] ${
                                  reached
                                    ? "text-amber-300/70"
                                    : "text-neutral-700"
                                }`}
                              >
                                {milestone}d
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Longest streak */}
              <motion.article
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.08,
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                      Personal Best
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Longest Streak
                    </h3>
                  </div>

                  <div
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/5 text-lg text-amber-200"
                  >
                    🏆
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">
                      {longestStreak}
                    </span>

                    <span className="text-sm text-neutral-500">
                      {longestStreak === 1
                        ? "day"
                        : "days"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    Your longest consecutive run so far.
                  </p>
                </div>

                <div className="mt-8 border-t border-white/5 pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">
                      Current vs personal best
                    </span>

                    <span className="font-medium text-neutral-400">
                      {longestStreak > 0
                        ? `${Math.min(
                            100,
                            Math.round(
                              (currentStreak /
                                longestStreak) *
                                100
                            )
                          )}%`
                        : "0%"}
                    </span>
                  </div>

                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-900"
                    role="progressbar"
                    aria-valuenow={
                      longestStreak > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (currentStreak /
                                longestStreak) *
                                100
                            )
                          )
                        : 0
                    }
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Current streak compared with personal best"
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${
                          longestStreak >
                          0
                            ? Math.min(
                                100,
                                Math.round(
                                  (currentStreak /
                                    longestStreak) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                      }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full bg-amber-300/80"
                    />
                  </div>
                </div>
              </motion.article>
            </div>
          </motion.section>

          {/* QUEST PROGRESS */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={dashboardReveal}
            className="mb-8"
          >
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Daily Progress
                </p>

                <h2
                  id="quest-progress-title"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  Quest Progress
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Turn completed real-world actions into character progression.
                </p>
              </div>

              <Link
                to="/tasks"
                className="text-sm font-medium text-amber-300 transition hover:text-amber-200"
              >
                Manage Quests →
              </Link>
            </div>

            <motion.article
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
            >
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-xl text-amber-200"
                  >
                    ✓
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
                      Completion Rate
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {completedTasks}
                      <span className="text-sm font-normal text-neutral-600">
                        {" "}
                        / {totalTasks} quests
                      </span>
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-600">
                      Overall progress
                    </span>

                    <span className="text-xs font-medium text-amber-300/70">
                      {taskProgress}%
                    </span>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-neutral-900"
                    role="progressbar"
                    aria-valuenow={taskProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`Quest completion: ${taskProgress}%`}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${taskProgress}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full bg-amber-300"
                    />
                  </div>
                </div>
              </div>
            </motion.article>
          </motion.section>

          {/* LEADERBOARD */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={dashboardReveal}
            className="mb-8"
          >
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Global Rankings
                </p>

                <h2
                  id="leaderboard-title"
                  className="mt-1 text-xl font-semibold"
                >
                  Leaderboard
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  See how adventurers are progressing across the rankings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div>
                  <label
                    htmlFor="leaderboard-metric"
                    className="mb-1.5 block text-xs font-medium text-neutral-500"
                  >
                    Rank by
                  </label>

                  <select
                    id="leaderboard-metric"
                    value={leaderboardMetric}
                    aria-describedby="leaderboard-controls-help"
                    onChange={(event) =>
                      setLeaderboardMetric(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10 sm:w-44"
                  >
                    {LEADERBOARD_METRICS.map(
                      (metric) => (
                        <option
                          key={metric.value}
                          value={metric.value}
                          className="bg-neutral-900"
                        >
                          {metric.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="leaderboard-limit"
                    className="mb-1.5 block text-xs font-medium text-neutral-500"
                  >
                    Show
                  </label>

                  <select
                    id="leaderboard-limit"
                    value={leaderboardLimit}
                    aria-describedby="leaderboard-controls-help"
                    onChange={(event) =>
                      setLeaderboardLimit(
                        Number(
                          event.target.value
                        )
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10 sm:w-28"
                  >
                    {LEADERBOARD_LIMITS.map(
                      (limit) => (
                        <option
                          key={limit}
                          value={limit}
                          className="bg-neutral-900"
                        >
                          Top {limit}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <p id="leaderboard-controls-help" className="sr-only">
                Choose the ranking metric and the number of top adventurers to display.
              </p>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/60">
                  Your Global Rank
                </p>

                <p className="mt-1 text-sm text-neutral-300">
                  Ranked by {selectedMetricLabel}
                </p>
              </div>

              <div className="text-2xl font-bold text-amber-200">
                {currentUserRank
                  ? `#${currentUserRank}`
                  : "—"}
              </div>
            </div>

            {loadingLeaderboard && (
              <div
                className="mt-5 space-y-3"
                role="status"
                aria-live="polite"
                aria-label="Loading leaderboard"
              >
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-white/5"
                    />
                  )
                )}
              </div>
            )}

            {leaderboardError &&
              !loadingLeaderboard && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
                  <p
                    className="text-sm text-red-300"
                    role="alert"
                    aria-live="assertive"
                  >
                    {leaderboardError}
                  </p>

                  <button
                    type="button"
                    onClick={fetchLeaderboard}
                    className="mt-2 rounded-md text-sm font-medium text-amber-300 transition hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-amber-300 focus-visible:outline-offset-3"
                  >
                    Try again →
                  </button>
                </div>
              )}

            {!loadingLeaderboard &&
              !leaderboardError &&
              leaderboard.length === 0 && (
                <div
                  className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm text-neutral-500">
                    No ranking data available yet.
                  </p>
                </div>
              )}

            {!loadingLeaderboard &&
              !leaderboardError &&
              leaderboard.length > 0 && (
                <div
                  className="mt-5 overflow-hidden rounded-2xl border border-white/5"
                  role="table"
                  aria-label={`Global leaderboard ranked by ${selectedMetricLabel}`}
                  aria-rowcount={leaderboard.length + 1}
                >
                  <div
                    className="hidden grid-cols-[70px_1fr_120px_150px] border-b border-white/5 bg-black/20 px-5 py-3 text-xs uppercase tracking-wider text-neutral-600 sm:grid"
                    role="row"
                    aria-rowindex="1"
                  >
                    <span role="columnheader">Rank</span>

                    <span role="columnheader">Adventurer</span>

                    <span role="columnheader">Level</span>

                    <span role="columnheader" className="text-right">
                      {selectedMetricLabel}
                    </span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {leaderboard.map(
                      (player) => (
                        <LeaderboardRow
                          key={`${player.rank}-${player.name}`}
                          player={player}
                          metricValue={getMetricDisplayValue(
                            player
                          )}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
          </motion.section>

          {/* FINAL CTA */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            variants={dashboardReveal}
            className="rounded-3xl border border-amber-300/10 bg-gradient-to-br from-amber-300/[0.08] to-transparent p-6 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                  Keep the momentum
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Every completed quest moves you forward.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Turn today's real-world actions into tomorrow's stronger character.
                </p>
              </div>

              <Link
                to="/tasks"
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/15 hover:text-amber-100"
              >
                Continue Your Journey →
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function ProgressInfo({
  label,
  value,
  description,
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: DASHBOARD_EASE }}
      className="rounded-2xl border border-white/5 bg-black/20 p-4 transition-[border-color,background-color] duration-300 hover:border-white/10 hover:bg-black/25"
    >
      <p className="text-xs uppercase tracking-wider text-neutral-600">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-neutral-100">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-600">
        {description}
      </p>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: DASHBOARD_EASE }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-[border-color,background-color,box-shadow] duration-300 hover:border-amber-300/20 hover:bg-white/[0.045] hover:shadow-lg hover:shadow-black/10"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          {label}
        </p>

        <span
          aria-hidden="true"
          className="text-sm text-amber-300/70"
        >
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

function LeaderboardRow({
  player,
  metricValue,
}) {
  const isTopThree = player.rank <= 3;

  return (
    <div
      role="row"
      aria-rowindex={player.rank + 1}
      aria-label={`Rank ${player.rank}, ${player.name}, Level ${player.level}, ${metricValue}`}
      className={`grid gap-3 px-4 py-4 transition sm:grid-cols-[70px_1fr_120px_150px] sm:items-center sm:px-5 ${
        isTopThree
          ? "bg-amber-300/[0.025]"
          : "hover:bg-white/[0.025]"
      }`}
    >
      <div role="cell" className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
            player.rank === 1
              ? "bg-amber-300/15 text-amber-200"
              : player.rank === 2
              ? "bg-white/10 text-neutral-300"
              : player.rank === 3
              ? "bg-orange-300/10 text-orange-200"
              : "bg-white/5 text-neutral-500"
          }`}
        >
          {player.rank}
        </span>

        <span className="text-xs text-neutral-600 sm:hidden">
          Rank
        </span>
      </div>

      <div role="cell" className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-200">
          {player.name}
        </p>

        <p className="mt-1 text-xs text-neutral-600 sm:hidden">
          Level {player.level} · {metricValue}
        </p>
      </div>

      <div role="cell" className="hidden text-sm text-neutral-400 sm:block">
        Level {player.level}
      </div>

      <div role="cell" className="hidden text-right text-sm font-medium text-amber-200 sm:block">
        {metricValue}
      </div>
    </div>
  );
}

export default Dashboard;