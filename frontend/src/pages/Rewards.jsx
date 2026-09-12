import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:5000/api";

const REWARD_TYPES = [
  {
    value: "all",
    label: "All Rewards",
  },
  {
    value: "item",
    label: "Items",
  },
  {
    value: "theme",
    label: "Themes",
  },
  {
    value: "badge",
    label: "Badges",
  },
];

function Rewards() {
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);

  const [selectedType, setSelectedType] = useState("all");

  const [loadingRewards, setLoadingRewards] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const [purchasingId, setPurchasingId] = useState(null);

  const [error, setError] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [purchaseError, setPurchaseError] = useState("");

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

    fetchUser();
    fetchRewards();
  }, [token, navigate]);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your character"
        );
      }

      setUser(result.data.user);
    } catch (err) {
      console.error("Rewards user error:", err);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token"
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to load your character");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchRewards = async () => {
    try {
      setLoadingRewards(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/rewards`, {
        method: "GET",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load rewards"
        );
      }

      setRewards(result.data.rewards || []);
    } catch (err) {
      console.error("Rewards fetch error:", err);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token"
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(err.message || "Unable to load rewards");
    } finally {
      setLoadingRewards(false);
    }
  };

  const handlePurchase = async (reward) => {
    if (!reward?._id || purchasingId) {
      return;
    }

    setPurchaseMessage("");
    setPurchaseError("");
    setPurchasingId(reward._id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/rewards/${reward._id}/purchase`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to purchase this reward"
        );
      }

      /*
       * Backend remains authoritative for currency
       * and inventory.
       */
      await fetchUser();

      setPurchaseMessage(
        `${reward.name} has been added to your inventory.`
      );
    } catch (err) {
      console.error("Reward purchase error:", err);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token"
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setPurchaseError(
        err.message || "Unable to purchase this reward"
      );
    } finally {
      setPurchasingId(null);
    }
  };

  const ownedRewardIds = useMemo(() => {
    const inventory = user?.inventory || [];

    return new Set(
      inventory
        .map((entry) => {
          if (!entry?.reward) {
            return null;
          }

          if (typeof entry.reward === "string") {
            return entry.reward;
          }

          return entry.reward._id || entry.reward.id;
        })
        .filter(Boolean)
        .map(String)
    );
  }, [user]);

  const filteredRewards =
    selectedType === "all"
      ? rewards
      : rewards.filter(
          (reward) => reward.type === selectedType
        );

  const currency = user?.currency || 0;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.08, 1, 1.08],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl"
        />
      </div>

      <div className="relative">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* HEADER */}

          <section className="mb-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/80"
                >
                  Adventurer Rewards
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.04,
                  }}
                  className="text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  Reward Shop
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1,
                  }}
                  className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base"
                >
                  Spend the currency you've earned from completing
                  your quests and unlock rewards for your journey.
                </motion.p>
              </div>

              {/* CURRENCY */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 14,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -3,
                  scale: 1.015,
                }}
                className="group flex w-fit items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 shadow-[0_0_30px_rgba(252,211,77,0.03)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(252,211,77,0.08)]"
              >
                <motion.div
                  animate={{
                    rotate: [0, 4, -4, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-lg text-amber-200"
                >
                  ◈
                </motion.div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300/60">
                    Your Currency
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currency}
                      initial={{
                        opacity: 0,
                        y: 5,
                        scale: 0.95,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.22,
                      }}
                      className="mt-0.5 text-xl font-bold text-white"
                    >
                      {loadingUser ? "—" : currency}

                      <span className="ml-1.5 text-xs font-medium text-neutral-500">
                        coins
                      </span>
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FEEDBACK */}

          <AnimatePresence mode="wait">
            {purchaseMessage && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -14,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="mb-6 overflow-hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300"
                  >
                    ✓
                  </motion.span>

                  <p className="text-sm text-emerald-200">
                    {purchaseMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {purchaseError && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -14,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.98,
                }}
                className="mb-6 overflow-hidden rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-300"
                  >
                    !
                  </motion.span>

                  <p className="text-sm text-red-300">
                    {purchaseError}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTER */}

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
              duration: 0.35,
              delay: 0.12,
            }}
            className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
                Browse Rewards
              </p>

              <p className="mt-1 text-sm text-neutral-400">
                Choose a reward category.
              </p>
            </div>

            <div
              className="flex max-w-full gap-2 overflow-x-auto pb-1"
              aria-label="Reward categories"
            >
              {REWARD_TYPES.map((type) => {
                const isSelected =
                  selectedType === type.value;

                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setSelectedType(type.value)
                    }
                    aria-pressed={isSelected}
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      isSelected
                        ? "bg-amber-300 text-neutral-950 shadow-[0_0_20px_rgba(252,211,77,0.12)]"
                        : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-amber-300/20 hover:text-neutral-200"
                    }`}
                  >
                    {type.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          {/* ERROR */}

          <AnimatePresence>
            {error && !loadingRewards && (
              <motion.section
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5"
              >
                <p className="text-sm text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    fetchRewards();
                    fetchUser();
                  }}
                  className="mt-3 text-sm font-medium text-amber-300 transition hover:text-amber-200"
                >
                  Try again →
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {/* LOADING */}

          {loadingRewards && (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.div
                  key={item}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: item * 0.04,
                  }}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="h-48 animate-pulse bg-white/5" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />

                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />

                    <div className="h-11 w-full animate-pulse rounded-xl bg-white/10" />
                  </div>
                </motion.div>
              ))}
            </section>
          )}

          {/* EMPTY */}

          <AnimatePresence mode="wait">
            {!loadingRewards &&
              !error &&
              filteredRewards.length === 0 && (
                <motion.section
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center"
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

                  <h2 className="mt-5 text-lg font-semibold">
                    No rewards available
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                    There are currently no rewards in this category.
                  </p>
                </motion.section>
              )}
          </AnimatePresence>

          {/* REWARDS */}

          {!loadingRewards &&
            !error &&
            filteredRewards.length > 0 && (
              <motion.section
                layout
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredRewards.map((reward, index) => {
                    const isOwned = ownedRewardIds.has(
                      String(reward._id)
                    );

                    const canAfford =
                      currency >= (reward.cost || 0);

                    const isPurchasing =
                      purchasingId === reward._id;

                    return (
                      <motion.article
                        key={reward._id}
                        layout
                        initial={{
                          opacity: 0,
                          y: 24,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          scale: 0.97,
                        }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={
                          isOwned
                            ? {
                                y: -4,
                              }
                            : {
                                y: -7,
                                scale: 1.008,
                              }
                        }
                        className={`group relative overflow-hidden rounded-3xl border bg-white/[0.03] transition duration-300 ${
                          isOwned
                            ? "border-emerald-300/15 shadow-[0_0_25px_rgba(52,211,153,0.025)]"
                            : "border-white/10 hover:border-amber-300/20 hover:bg-white/[0.045] hover:shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                        }`}
                      >
                        {/* HOVER LIGHT */}

                        <motion.div
                          initial={{
                            opacity: 0,
                          }}
                          whileHover={{
                            opacity: 1,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-amber-300/40"
                        />

                        {/* VISUAL AREA */}

                        <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-br from-amber-300/[0.08] via-transparent to-transparent">
                          <motion.div
                            initial={{
                              opacity: 0.6,
                              scale: 1,
                            }}
                            whileHover={{
                              opacity: 1,
                              scale: 1.12,
                            }}
                            transition={{
                              duration: 0.45,
                            }}
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,211,77,0.08),transparent_55%)]"
                          />

                          {/* DECORATIVE ORBIT */}

                          <motion.div
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 18,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="pointer-events-none absolute h-32 w-32 rounded-full border border-amber-300/[0.04]"
                          />

                          {reward.image ? (
                            <motion.img
                              src={reward.image}
                              alt={reward.name}
                              whileHover={{
                                scale: 1.06,
                              }}
                              transition={{
                                duration: 0.45,
                              }}
                              className="relative h-full w-full object-cover"
                            />
                          ) : (
                            <motion.div
                              whileHover={{
                                scale: 1.1,
                                rotate: 4,
                              }}
                              whileTap={{
                                scale: 0.96,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 250,
                                damping: 15,
                              }}
                              className={`relative flex h-24 w-24 items-center justify-center rounded-3xl border text-4xl shadow-[0_0_50px_rgba(252,211,77,0.08)] ${
                                isOwned
                                  ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-300"
                                  : "border-amber-300/20 bg-amber-300/[0.06] text-amber-200"
                              }`}
                            >
                              {getRewardIcon(reward.type)}
                            </motion.div>
                          )}

                          {/* TYPE */}

                          <span className="absolute left-4 top-4 rounded-lg border border-white/10 bg-neutral-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 backdrop-blur">
                            {reward.type}
                          </span>

                          {/* OWNED */}

                          <AnimatePresence>
                            {isOwned && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  scale: 0.8,
                                  x: 8,
                                }}
                                animate={{
                                  opacity: 1,
                                  scale: 1,
                                  x: 0,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 350,
                                  damping: 18,
                                }}
                                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-emerald-300/20 bg-neutral-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300 backdrop-blur"
                              >
                                <motion.span
                                  initial={{
                                    scale: 0,
                                  }}
                                  animate={{
                                    scale: 1,
                                  }}
                                  transition={{
                                    delay: 0.1,
                                    type: "spring",
                                    stiffness: 450,
                                    damping: 15,
                                  }}
                                >
                                  ✓
                                </motion.span>

                                Owned
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* CONTENT */}

                        <div className="p-5">
                          <div className="min-h-[96px]">
                            <motion.h2
                              layout="position"
                              className="text-lg font-semibold text-neutral-100 transition-colors duration-300 group-hover:text-white"
                            >
                              {reward.name}
                            </motion.h2>

                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-500">
                              {reward.description ||
                                "A reward for your character journey."}
                            </p>
                          </div>

                          {/* PRICE */}

                          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                                Cost
                              </p>

                              <div className="mt-1 flex items-center gap-1.5">
                                <motion.span
                                  whileHover={{
                                    scale: 1.12,
                                    rotate: 5,
                                  }}
                                  className="text-lg text-amber-300"
                                >
                                  ◈
                                </motion.span>

                                <span className="text-lg font-bold text-neutral-200">
                                  {reward.cost || 0}
                                </span>

                                <span className="text-xs text-neutral-600">
                                  coins
                                </span>
                              </div>
                            </div>

                            <AnimatePresence mode="wait">
                              {!isOwned &&
                                !canAfford && (
                                  <motion.span
                                    key="not-enough"
                                    initial={{
                                      opacity: 0,
                                      x: 5,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    className="text-right text-[10px] uppercase tracking-wider text-red-300/70"
                                  >
                                    Not enough
                                  </motion.span>
                                )}

                              {!isOwned &&
                                canAfford && (
                                  <motion.span
                                    key="available"
                                    initial={{
                                      opacity: 0,
                                      x: 5,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      x: 0,
                                    }}
                                    className="text-right text-[10px] uppercase tracking-wider text-amber-300/60"
                                  >
                                    Available
                                  </motion.span>
                                )}

                              {isOwned && (
                                <motion.span
                                  key="unlocked"
                                  initial={{
                                    opacity: 0,
                                    x: 5,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                  }}
                                  className="text-right text-[10px] uppercase tracking-wider text-emerald-300/60"
                                >
                                  Unlocked
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* ACTION */}

                          <motion.button
                            type="button"
                            onClick={() =>
                              handlePurchase(reward)
                            }
                            disabled={
                              isOwned ||
                              !canAfford ||
                              isPurchasing ||
                              loadingUser
                            }
                            whileHover={
                              !isOwned &&
                              canAfford &&
                              !loadingUser
                                ? {
                                    y: -2,
                                  }
                                : undefined
                            }
                            whileTap={
                              !isOwned &&
                              canAfford &&
                              !loadingUser
                                ? {
                                    scale: 0.975,
                                  }
                                : undefined
                            }
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                            className={`relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                              isOwned
                                ? "cursor-default border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                                : !canAfford
                                ? "cursor-not-allowed border border-white/5 bg-white/[0.02] text-neutral-600"
                                : "bg-amber-300 text-neutral-950 shadow-[0_8px_25px_rgba(252,211,77,0.08)] hover:bg-amber-200 hover:shadow-[0_10px_30px_rgba(252,211,77,0.14)]"
                            }`}
                          >
                            {/* BUTTON SHIMMER */}

                            {!isOwned &&
                              canAfford &&
                              !isPurchasing && (
                                <motion.span
                                  initial={{
                                    x: "-120%",
                                  }}
                                  animate={{
                                    x: "120%",
                                  }}
                                  transition={{
                                    duration: 2.2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                  }}
                                  className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-18deg] bg-white/20 blur-sm"
                                />
                              )}

                            <span className="relative z-10 flex items-center gap-2">
                              {isPurchasing ? (
                                <>
                                  <motion.span
                                    animate={{
                                      rotate: 360,
                                    }}
                                    transition={{
                                      duration: 0.8,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                    className="h-4 w-4 rounded-full border-2 border-neutral-950/30 border-t-neutral-950"
                                  />

                                  Purchasing...
                                </>
                              ) : isOwned ? (
                                <>
                                  <motion.span
                                    initial={{
                                      scale: 0.5,
                                    }}
                                    animate={{
                                      scale: 1,
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 15,
                                    }}
                                  >
                                    ✓
                                  </motion.span>

                                  In Inventory
                                </>
                              ) : !canAfford ? (
                                "Need More Coins"
                              ) : (
                                <>
                                  Purchase

                                  <motion.span
                                    animate={{
                                      x: [0, 3, 0],
                                    }}
                                    transition={{
                                      duration: 1.5,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    →
                                  </motion.span>
                                </>
                              )}
                            </span>
                          </motion.button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </motion.section>
            )}

          {/* FOOTER INFO */}

          {!loadingRewards && rewards.length > 0 && (
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
                duration: 0.4,
                delay: 0.2,
              }}
              className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-300">
                    Earn more currency through quests.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-600">
                    Complete real-life tasks to earn currency and
                    unlock more rewards.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  whileHover={{
                    x: 3,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="w-fit text-sm font-medium text-amber-300 transition hover:text-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Go to Quests →
                </motion.button>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </main>
  );
}

function getRewardIcon(type) {
  if (type === "theme") {
    return "◉";
  }

  if (type === "badge") {
    return "◆";
  }

  return "✦";
}

export default Rewards;