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
       * The backend remains authoritative for currency
       * and inventory. Refresh the user after a successful
       * purchase so the UI reflects the persisted state.
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
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* HEADER */}
          <section className="mb-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-300/80">
                  Adventurer Rewards
                </p>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Reward Shop
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                  Spend the currency you've earned from completing
                  your quests and unlock rewards for your journey.
                </p>
              </div>

              {/* CURRENCY */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-fit items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-lg text-amber-200">
                  ◈
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300/60">
                    Your Currency
                  </p>

                  <p className="mt-0.5 text-xl font-bold text-white">
                    {loadingUser ? "—" : currency}
                    <span className="ml-1.5 text-xs font-medium text-neutral-500">
                      coins
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* FEEDBACK */}
          <AnimatePresence mode="wait">
            {purchaseMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                    ✓
                  </span>

                  <p className="text-sm text-emerald-200">
                    {purchaseMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {purchaseError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-300">
                    !
                  </span>

                  <p className="text-sm text-red-300">
                    {purchaseError}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FILTER */}
          <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
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
              {REWARD_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  aria-pressed={selectedType === type.value}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                    selectedType === type.value
                      ? "bg-amber-300 text-neutral-950"
                      : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-amber-300/20 hover:text-neutral-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          {/* ERROR */}
          {error && !loadingRewards && (
            <section className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5">
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
            </section>
          )}

          {/* LOADING */}
          {loadingRewards && (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="h-48 animate-pulse bg-white/5" />

                  <div className="space-y-4 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/10" />

                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />

                    <div className="h-11 w-full animate-pulse rounded-xl bg-white/10" />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* EMPTY */}
          {!loadingRewards &&
            !error &&
            filteredRewards.length === 0 && (
              <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-xl text-amber-200">
                  ◈
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  No rewards available
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  There are currently no rewards in this category.
                </p>
              </section>
            )}

          {/* REWARDS */}
          {!loadingRewards &&
            !error &&
            filteredRewards.length > 0 && (
              <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      initial={{
                        opacity: 0,
                        y: 18,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                      }}
                      className={`group relative overflow-hidden rounded-3xl border bg-white/[0.03] transition duration-300 ${
                        isOwned
                          ? "border-emerald-300/15"
                          : "border-white/10 hover:border-amber-300/20 hover:bg-white/[0.045]"
                      }`}
                    >
                      {/* VISUAL AREA */}
                      <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-white/5 bg-gradient-to-br from-amber-300/[0.08] via-transparent to-transparent">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,211,77,0.08),transparent_55%)]" />

                        {reward.image ? (
                          <img
                            src={reward.image}
                            alt={reward.name}
                            className="relative h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <motion.div
                            whileHover={{
                              scale: 1.08,
                              rotate: 3,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 250,
                              damping: 15,
                            }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] text-4xl text-amber-200 shadow-[0_0_50px_rgba(252,211,77,0.08)]"
                          >
                            {getRewardIcon(reward.type)}
                          </motion.div>
                        )}

                        {/* TYPE */}
                        <span className="absolute left-4 top-4 rounded-lg border border-white/10 bg-neutral-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 backdrop-blur">
                          {reward.type}
                        </span>

                        {/* OWNED */}
                        {isOwned && (
                          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-emerald-300/20 bg-neutral-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300 backdrop-blur">
                            <span>✓</span>
                            Owned
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">
                        <div className="min-h-[96px]">
                          <h2 className="text-lg font-semibold text-neutral-100">
                            {reward.name}
                          </h2>

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
                              <span className="text-lg text-amber-300">
                                ◈
                              </span>

                              <span className="text-lg font-bold text-neutral-200">
                                {reward.cost || 0}
                              </span>

                              <span className="text-xs text-neutral-600">
                                coins
                              </span>
                            </div>
                          </div>

                          {!isOwned && !canAfford && (
                            <span className="text-right text-[10px] uppercase tracking-wider text-red-300/70">
                              Not enough
                            </span>
                          )}

                          {!isOwned && canAfford && (
                            <span className="text-right text-[10px] uppercase tracking-wider text-amber-300/60">
                              Available
                            </span>
                          )}
                        </div>

                        {/* ACTION */}
                        <button
                          type="button"
                          onClick={() => handlePurchase(reward)}
                          disabled={
                            isOwned ||
                            !canAfford ||
                            isPurchasing ||
                            loadingUser
                          }
                          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                            isOwned
                              ? "cursor-default border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300"
                              : !canAfford
                              ? "cursor-not-allowed border border-white/5 bg-white/[0.02] text-neutral-600"
                              : "bg-amber-300 text-neutral-950 hover:bg-amber-200"
                          }`}
                        >
                          {isPurchasing ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950/30 border-t-neutral-950" />
                              Purchasing...
                            </>
                          ) : isOwned ? (
                            <>
                              <span>✓</span>
                              In Inventory
                            </>
                          ) : !canAfford ? (
                            "Need More Coins"
                          ) : (
                            <>
                              Purchase
                              <span>→</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </section>
            )}

          {/* FOOTER INFO */}
          {!loadingRewards && rewards.length > 0 && (
            <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
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

                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="w-fit text-sm font-medium text-amber-300 transition hover:text-amber-200"
                >
                  Go to Quests →
                </button>
              </div>
            </section>
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