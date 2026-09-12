import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

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

  const {
    user,
    token,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, token, navigate]);

  useEffect(() => {
    if (!token || authLoading) {
      return;
    }

    if (!user) {
      refreshUser();
    }
  }, [token, authLoading, user, refreshUser]);

  useEffect(() => {
    if (!token || authLoading) {
      return;
    }

    const fetchRewards = async () => {
      try {
        setRewardsLoading(true);
        setRewardsError("");

        const response = await fetch(`${API_BASE_URL}/rewards`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load rewards"
          );
        }

        setRewards(result.data?.rewards || []);
      } catch (error) {
        console.error("Profile rewards error:", error);

        if (
          error.message === "Token expired" ||
          error.message === "Invalid token"
        ) {
          navigate("/login", { replace: true });
          return;
        }

        setRewardsError(
          error.message || "Unable to load rewards"
        );
      } finally {
        setRewardsLoading(false);
      }
    };

    fetchRewards();
  }, [token, authLoading, navigate]);

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

  const inventoryRewards = useMemo(() => {
    if (!inventory.length) {
      return [];
    }

    return inventory.map((entry, index) => {
      if (
        entry?.reward &&
        typeof entry.reward === "object"
      ) {
        return {
          entry,
          reward: entry.reward,
          index,
        };
      }

      const rewardId =
        typeof entry?.reward === "string"
          ? entry.reward
          : entry?.reward?._id ||
            entry?.reward?.id ||
            null;

      if (!rewardId) {
        return {
          entry,
          reward: null,
          index,
        };
      }

      const matchedReward = rewards.find(
        (reward) =>
          String(reward?._id) === String(rewardId)
      );

      return {
        entry,
        reward: matchedReward || null,
        index,
      };
    });
  }, [inventory, rewards]);

  if (authLoading || (!user && token)) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-48 animate-pulse rounded-3xl bg-white/[0.04]"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: item * 0.05 }}
                  className="h-28 animate-pulse rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>

            <div className="h-80 animate-pulse rounded-3xl bg-white/[0.03]" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* AMBIENT BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.08, 1, 1.08],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl"
        />
      </div>

      <div className="relative">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* PAGE HEADER */}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
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
          </motion.section>

          {/* CHARACTER HERO */}

          <motion.section
            initial={{
              opacity: 0,
              y: 22,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              y: -2,
            }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-shadow duration-500 hover:shadow-[0_20px_70px_rgba(0,0,0,0.18)]"
          >
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.45, 0.7, 0.45],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl"
            />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  {/* AVATAR */}

                  <motion.div
                    initial={{
                      scale: 0.7,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 18,
                      delay: 0.1,
                    }}
                    whileHover={{
                      scale: 1.04,
                      rotate: 1,
                    }}
                    className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/[0.08] text-4xl font-bold text-amber-200 shadow-[0_0_45px_rgba(252,211,77,0.08)]"
                  >
                    {initials}

                    <motion.div
                      initial={{
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 16,
                        delay: 0.3,
                      }}
                      className="absolute -bottom-2 -right-2 flex h-9 min-w-9 items-center justify-center rounded-xl border border-neutral-900 bg-amber-300 px-2 text-xs font-bold text-neutral-950"
                    >
                      {currentLevel}
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: 0.18,
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/70">
                      Adventurer
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                      {user.name || "Adventurer"}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                      {user.email}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    to="/tasks"
                    className="inline-flex w-fit items-center justify-center rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 shadow-[0_8px_25px_rgba(252,211,77,0.06)] transition hover:bg-amber-200 hover:shadow-[0_10px_30px_rgba(252,211,77,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Continue Questing →
                  </Link>
                </motion.div>
              </div>

              {/* LEVEL */}

              <div className="mt-8 border-t border-white/5 pt-7">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
                      Current Level
                    </p>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentLevel}-${currentXp}`}
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="mt-1 flex items-baseline gap-2"
                      >
                        <span className="text-3xl font-bold">
                          Level {currentLevel}
                        </span>

                        <span className="text-sm text-neutral-600">
                          {currentXp} XP
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-amber-200"
                  >
                    {Math.max(
                      0,
                      nextLevelXP - currentXp
                    )}{" "}
                    XP to Level {currentLevel + 1}
                  </motion.p>
                </div>

                {/* XP BAR */}

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
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative h-full rounded-full bg-amber-300"
                  >
                    <motion.div
                      animate={{
                        x: ["-100%", "250%"],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-y-0 w-1/3 skew-x-[-18deg] bg-white/25 blur-sm"
                    />
                  </motion.div>
                </div>

                <div className="mt-2 flex justify-between text-xs text-neutral-600">
                  <span>{currentLevelXP} XP</span>

                  <motion.span
                    key={levelProgress}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-amber-300/70"
                  >
                    {levelProgress}% complete
                  </motion.span>

                  <span>{nextLevelXP} XP</span>
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
              delay={0}
            />

            <ProfileStat
              label="Total XP"
              value={currentXp}
              suffix="earned"
              icon="XP"
              delay={0.05}
            />

            <ProfileStat
              label="Currency"
              value={user.currency || 0}
              suffix="coins"
              icon="◈"
              delay={0.1}
            />

            <ProfileStat
              label="Current Streak"
              value={streak.current || 0}
              suffix="days"
              icon="🔥"
              delay={0.15}
            />
          </section>

          {/* CHARACTER ATTRIBUTES */}

          <section className="mb-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.35,
              }}
              className="mb-5"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300/70">
                Character Build
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Attributes
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                The stats you've developed through your quests.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {ATTRIBUTE_CONFIG.map((attribute, index) => {
                const value =
                  attributes[attribute.key] || 0;

                const progress = Math.min(
                  100,
                  value * 10
                );

                return (
                  <motion.article
                    key={attribute.key}
                    initial={{
                      opacity: 0,
                      y: 18,
                      scale: 0.985,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.15,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      y: -5,
                    }}
                    className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-amber-300/20 hover:bg-white/[0.045] hover:shadow-[0_18px_45px_rgba(0,0,0,0.16)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{
                            scale: 1.08,
                            rotate: 4,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 15,
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/5 text-amber-200"
                        >
                          {attribute.icon}
                        </motion.div>

                        <div>
                          <p className="text-[10px] font-bold tracking-[0.18em] text-amber-300/60">
                            {attribute.short}
                          </p>

                          <h3 className="mt-0.5 font-semibold">
                            {attribute.label}
                          </h3>
                        </div>
                      </div>

                      <motion.span
                        key={value}
                        initial={{
                          scale: 0.85,
                          opacity: 0.5,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 18,
                        }}
                        className="text-3xl font-bold"
                      >
                        {value}
                      </motion.span>
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
                          whileInView={{
                            width: `${progress}%`,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.08,
                            ease: "easeOut",
                          }}
                          className="relative h-full rounded-full bg-amber-300"
                        >
                          <div className="absolute right-0 top-0 h-full w-8 bg-white/25 blur-sm" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* STREAK */}

          <section className="mb-8 grid gap-4 lg:grid-cols-2">
            <StreakCard
              title="Current Streak"
              eyebrow="Consistency"
              value={streak.current || 0}
              icon="🔥"
              description="Keep completing quests on consecutive days to maintain your momentum."
              highlight
              delay={0}
            />

            <StreakCard
              title="Longest Streak"
              eyebrow="Personal Best"
              value={streak.longest || 0}
              icon="🏆"
              description="Your longest consecutive run since starting your journey."
              delay={0.08}
            />
          </section>

          {/* INVENTORY */}

          <section className="mb-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.35,
              }}
              className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
            >
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

              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/rewards"
                  className="text-sm font-medium text-amber-300 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Visit Reward Shop →
                </Link>
              </motion.div>
            </motion.div>

            {inventory.length === 0 ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center"
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-xl text-amber-200"
                >
                  ◈
                </motion.div>

                <h3 className="mt-5 font-semibold">
                  Your inventory is empty
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                  Complete quests, earn currency and unlock your
                  first reward.
                </p>

                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 inline-block"
                >
                  <Link
                    to="/rewards"
                    className="inline-flex rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200"
                  >
                    Explore Rewards
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inventoryRewards.map(
                  ({ entry, reward, index }) => {
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
                          entry?._id ||
                          index
                        }
                        initial={{
                          opacity: 0,
                          y: 18,
                          scale: 0.98,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.12,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={{
                          y: -6,
                          scale: 1.008,
                        }}
                        className="group overflow-hidden rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.025] shadow-[0_0_25px_rgba(52,211,153,0.015)] transition-shadow duration-300 hover:border-emerald-300/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                      >
                        <div className="relative flex h-32 items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-br from-emerald-300/[0.05] to-transparent">
                          <motion.div
                            initial={{
                              scale: 1,
                              opacity: 0.5,
                            }}
                            whileHover={{
                              scale: 1.15,
                              opacity: 1,
                            }}
                            transition={{
                              duration: 0.4,
                            }}
                            className="absolute h-24 w-24 rounded-full bg-emerald-300/5 blur-2xl"
                          />

                          <motion.div
                            whileHover={{
                              scale: 1.1,
                              rotate: 4,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 280,
                              damping: 16,
                            }}
                            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/5 text-2xl text-emerald-300"
                          >
                            {getInventoryIcon(rewardType)}
                          </motion.div>

                          <motion.span
                            initial={{
                              opacity: 0,
                              scale: 0.8,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            transition={{
                              delay: 0.2 + index * 0.04,
                              type: "spring",
                              stiffness: 350,
                              damping: 18,
                            }}
                            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-300/15 bg-neutral-950/70 text-xs text-emerald-300 backdrop-blur"
                          >
                            ✓
                          </motion.span>
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-neutral-100 transition-colors group-hover:text-white">
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
                  }
                )}
              </div>
            )}

            {inventory.length > 0 &&
              rewardsLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-neutral-600"
                >
                  Loading reward details...
                </motion.p>
              )}

            {inventory.length > 0 &&
              !rewardsLoading &&
              rewardsError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-red-300/70"
                >
                  {rewardsError}
                </motion.p>
              )}
          </section>

          {/* ACCOUNT SUMMARY */}

          <motion.section
            initial={{
              opacity: 0,
              y: 14,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.4,
            }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.04] sm:p-7"
          >
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
                  value={Object.values(attributes).reduce(
                    (total, value) =>
                      total + (value || 0),
                    0
                  )}
                />

                <SummaryItem
                  label="Rewards"
                  value={inventory.length}
                />
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function ProfileStat({
  label,
  value,
  suffix,
  icon,
  delay = 0,
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 14,
        scale: 0.98,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.35,
        delay,
      }}
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 hover:border-amber-300/20 hover:bg-white/[0.045] hover:shadow-[0_14px_35px_rgba(0,0,0,0.14)]"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          {label}
        </p>

        <motion.span
          whileHover={{
            scale: 1.15,
            rotate: 4,
          }}
          className="text-xs font-bold text-amber-300/60"
        >
          {icon}
        </motion.span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="mt-3 flex items-baseline gap-2"
        >
          <span className="text-2xl font-semibold">
            {value}
          </span>

          <span className="text-xs text-neutral-600">
            {suffix}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.article>
  );
}

function StreakCard({
  title,
  eyebrow,
  value,
  icon,
  description,
  highlight = false,
  delay = 0,
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 16,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.4,
        delay,
      }}
      whileHover={{
        y: -5,
      }}
      className={`group relative overflow-hidden rounded-3xl p-6 transition-shadow duration-300 ${
        highlight
          ? "border border-amber-300/15 bg-amber-300/[0.04] hover:shadow-[0_18px_50px_rgba(252,211,77,0.05)]"
          : "border border-white/10 bg-white/[0.03] hover:border-white/15 hover:shadow-[0_18px_50px_rgba(0,0,0,0.15)]"
      }`}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        whileHover={{
          opacity: 1,
          scale: 1,
        }}
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-300/5 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-xs uppercase tracking-[0.18em] ${
                highlight
                  ? "text-amber-300/60"
                  : "text-neutral-600"
              }`}
            >
              {eyebrow}
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              {title}
            </h2>
          </div>

          <motion.span
            whileHover={{
              scale: 1.15,
              rotate: 6,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            className="text-2xl"
          >
            {icon}
          </motion.span>
        </div>

        <motion.div
          key={value}
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 18,
          }}
          className="mt-7 flex items-baseline gap-2"
        >
          <span className="text-5xl font-bold">
            {value}
          </span>

          <span className="text-sm text-neutral-500">
            days
          </span>
        </motion.div>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

function SummaryItem({ label, value }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-center transition-colors hover:border-amber-300/10 hover:bg-black/30"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-lg font-semibold text-neutral-200"
        >
          {value}
        </motion.p>
      </AnimatePresence>

      <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
    </motion.div>
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