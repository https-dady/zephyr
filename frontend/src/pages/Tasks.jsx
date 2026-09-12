import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import RPGFeedback from "../components/RPGFeedback";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const TASK_CATEGORIES = [
  { value: "coding", label: "Coding", attribute: "Intellect" },
  { value: "gym", label: "Gym", attribute: "Strength" },
  { value: "fitness", label: "Fitness", attribute: "Vitality" },
  { value: "discipline", label: "Discipline", attribute: "Discipline" },
  { value: "learning", label: "Learning", attribute: "Intellect" },
  { value: "planning", label: "Planning", attribute: "Discipline" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "coding",
};

function Tasks() {
  const navigate = useNavigate();

  const {
    token,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingTask, setEditingTask] = useState(null);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [rpgFeedback, setRpgFeedback] = useState(null);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);

  const feedbackTimersRef = useRef([]);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchTasks();
  }, [authLoading, token, navigate]);

  useEffect(() => {
    return () => {
      feedbackTimersRef.current.forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "GET",
        headers: authHeaders,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load quests");
      }

      setTasks(result.data.tasks || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token"
      ) {
        navigate("/login", { replace: true });
        return;
      }

      setError(err.message || "Unable to load quests.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError("Quest title is required.");
      return;
    }

    if (!form.category) {
      setFormError("Please select a category.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      const isEditing = Boolean(editingTask);

      const endpoint = isEditing
        ? `${API_BASE_URL}/tasks/${editingTask._id}`
        : `${API_BASE_URL}/tasks`;

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title,
          description,
          category: form.category,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save quest");
      }

      if (isEditing) {
        const updatedTask = result.data.task;

        setTasks((previous) =>
          previous.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );

        setSuccessMessage("Quest updated successfully.");
      } else {
        const newTask = result.data.task;

        setTasks((previous) => [newTask, ...previous]);

        setSuccessMessage("New quest added to your journey.");
      }

      setForm(EMPTY_FORM);
      setEditingTask(null);
    } catch (err) {
      console.error("Save task error:", err);
      setFormError(err.message || "Unable to save quest.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      category: task.category || "coding",
    });

    setFormError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setSuccessMessage("");
  };

  const handleComplete = async (task) => {
    if (task.completed || completingId) return;

    try {
      setCompletingId(task._id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/tasks/${task._id}/complete`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to complete quest"
        );
      }

      const completedTask = result.data.task;

      setTasks((previous) =>
        previous.map((item) =>
          item._id === completedTask._id ? completedTask : item
        )
      );

      setRecentlyCompletedId(completedTask._id);

      const awardedXP =
        result.data.xp?.awarded ??
        result.data.xp?.amount ??
        result.data.xp?.gained ??
        10;

      const awardedCurrency =
        result.data.economy?.awarded ??
        result.data.economy?.currencyAwarded ??
        result.data.economy?.amount ??
        result.data.economy?.gained ??
        5;

      const currentStreak =
        result.data.streak?.current ??
        result.data.streak?.value ??
        null;

      const leveledUp =
        result.data.xp?.leveledUp === true ||
        result.data.xp?.levelUp === true ||
        result.data.xp?.levelledUp === true;

      feedbackTimersRef.current.forEach((timer) =>
        clearTimeout(timer)
      );

      feedbackTimersRef.current = [];

      setRpgFeedback({
        type: "xp",
        value: awardedXP,
        label: "Quest Complete • XP Earned",
      });

      feedbackTimersRef.current.push(
        setTimeout(() => {
          setRpgFeedback({
            type: "currency",
            value: awardedCurrency,
            label: "Reward Earned",
          });
        }, 950)
      );

      feedbackTimersRef.current.push(
        setTimeout(() => {
          setRpgFeedback({
            type: "streak",
            value: currentStreak ?? "✓",
            label: currentStreak
              ? "Streak Updated"
              : "Progress Streak",
          });
        }, 1900)
      );

      if (leveledUp) {
        feedbackTimersRef.current.push(
          setTimeout(() => {
            const nextLevel =
              result.data.xp?.level ??
              result.data.xp?.currentLevel ??
              result.data.level ??
              null;

            setRpgFeedback({
              type: "levelup",
              value: nextLevel ?? "UP!",
              label: "Level Up",
            });
          }, 2850)
        );
      }

      feedbackTimersRef.current.push(
        setTimeout(() => {
          setRpgFeedback(null);
        }, leveledUp ? 4200 : 3250)
      );

      feedbackTimersRef.current.push(
        setTimeout(() => {
          setRecentlyCompletedId(null);
        }, 800)
      );

      await refreshUser();

      setSuccessMessage(
        "Quest complete. Your character has progressed."
      );
    } catch (err) {
      console.error("Complete task error:", err);
      setError(err.message || "Unable to complete quest.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quest?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(taskId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete quest"
        );
      }

      setTasks((previous) =>
        previous.filter((task) => task._id !== taskId)
      );

      if (editingTask?._id === taskId) {
        handleCancelEdit();
      }

      setSuccessMessage("Quest removed from your journey.");
    } catch (err) {
      console.error("Delete task error:", err);
      setError(err.message || "Unable to delete quest.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const completionPercentage =
    tasks.length > 0
      ? Math.round(
          (completedTasks.length / tasks.length) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="relative">
        <Navbar />

        <RPGFeedback
          type={rpgFeedback?.type}
          value={rpgFeedback?.value}
          label={rpgFeedback?.label}
          show={Boolean(rpgFeedback)}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <section className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/70">
              Quest Board
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your Quests
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                  Turn the things you need to do into quests. Complete
                  them to earn XP, build your attributes, grow your
                  streak, and earn currency.
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-neutral-500">Active</span>

                  <span className="ml-2 font-semibold text-white">
                    {activeTasks.length}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-neutral-500">Done</span>

                  <span className="ml-2 font-semibold text-amber-200">
                    {completedTasks.length}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-4"
                role="status"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                    ✓
                  </span>

                  <p className="text-sm text-emerald-200">
                    {successMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
                role="alert"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-red-300">{error}</p>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-xs text-neutral-500 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-300/60">
                  Your journey
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {activeTasks.length > 0
                    ? "Active Quests"
                    : "Quest Board"}
                </h2>
              </div>

              {loadingTasks ? (
                <div
                  className="space-y-4"
                  aria-label="Loading quests"
                >
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-32 animate-pulse rounded-2xl bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <EmptyQuests />
              ) : (
                <>
                  {activeTasks.length > 0 ? (
                    <div className="space-y-4">
                      {activeTasks.map((task, index) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          completingId={completingId}
                          deletingId={deletingId}
                          recentlyCompletedId={
                            recentlyCompletedId
                          }
                          onComplete={handleComplete}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-emerald-300/10 bg-emerald-300/[0.03] p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-2xl text-emerald-300">
                        ✓
                      </div>

                      <h3 className="mt-4 text-lg font-semibold">
                        All quests complete
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                        Your active board is clear. Add another quest
                        and keep the progression going.
                      </p>
                    </div>
                  )}

                  {completedTasks.length > 0 && (
                    <section className="mt-10">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                          History
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-neutral-300">
                          Completed Quests
                        </h2>
                      </div>

                      <div className="space-y-3">
                        {completedTasks.map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            completed
                            completingId={completingId}
                            deletingId={deletingId}
                            recentlyCompletedId={
                              recentlyCompletedId
                            }
                            onComplete={handleComplete}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <motion.section
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="mb-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-xl text-amber-300">
                    {editingTask ? "✎" : "+"}
                  </div>

                  <h2 className="text-xl font-semibold">
                    {editingTask ? "Edit Quest" : "Create a Quest"}
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-neutral-500">
                    {editingTask
                      ? "Update the details of your quest."
                      : "Turn an everyday action into a progression opportunity."}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="task-title"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Quest title
                    </label>

                    <input
                      id="task-title"
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Finish React practice"
                      maxLength={120}
                      className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-description"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Description
                      <span className="ml-2 text-xs font-normal text-neutral-600">
                        optional
                      </span>
                    </label>

                    <textarea
                      id="task-description"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="What needs to be done?"
                      rows={4}
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-700 transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="task-category"
                      className="mb-2 block text-sm font-medium text-neutral-300"
                    >
                      Category
                    </label>

                    <select
                      id="task-category"
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10"
                    >
                      {TASK_CATEGORIES.map((category) => (
                        <option
                          key={category.value}
                          value={category.value}
                          className="bg-neutral-900"
                        >
                          {category.label} → {category.attribute}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-amber-300/60">
                      Quest reward
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-lg font-semibold text-amber-200">
                          +10
                        </p>

                        <p className="text-xs text-neutral-600">
                          XP
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-amber-200">
                          +5
                        </p>

                        <p className="text-xs text-neutral-600">
                          Currency
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-neutral-600">
                      Completing this quest also applies its category's
                      attribute progression through the backend.
                    </p>
                  </div>

                  {formError && (
                    <p
                      className="text-sm text-red-300"
                      role="alert"
                    >
                      {formError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : editingTask
                        ? "Save Changes"
                        : "Create Quest"}
                    </button>

                    {editingTask && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </motion.section>

              <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-600">
                      Quest completion
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {completionPercentage}%
                    </p>
                  </div>

                  <span className="text-sm text-neutral-500">
                    {completedTasks.length}/{tasks.length}
                  </span>
                </div>

                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800"
                  role="progressbar"
                  aria-valuenow={completionPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Quest completion: ${completionPercentage}%`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${completionPercentage}%`,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-amber-300"
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function TaskCard({
  task,
  index,
  completed = false,
  completingId,
  deletingId,
  recentlyCompletedId,
  onComplete,
  onEdit,
  onDelete,
}) {
  const category = TASK_CATEGORIES.find(
    (item) => item.value === task.category
  );

  const isCompleting = completingId === task._id;
  const isDeleting = deletingId === task._id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.2),
      }}
      className={`group rounded-2xl border p-5 transition ${
        completed
          ? "border-white/5 bg-white/[0.02]"
          : "border-white/10 bg-white/[0.04] hover:border-amber-300/20 hover:bg-white/[0.055]"
      } ${
        recentlyCompletedId === task._id
          ? "rpg-success-pop border-emerald-300/25 bg-emerald-300/[0.04]"
          : ""
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="shrink-0">
          <button
            type="button"
            disabled={completed || isCompleting}
            onClick={() => onComplete(task)}
            aria-label={
              completed
                ? `Completed: ${task.title}`
                : `Complete quest: ${task.title}`
            }
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
              completed
                ? "cursor-default border-emerald-300/15 bg-emerald-300/10 text-emerald-300"
                : "border-white/10 bg-neutral-900 text-neutral-600 hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            } ${
              recentlyCompletedId === task._id
                ? "scale-110 border-emerald-300/30 bg-emerald-300/15 text-emerald-300 shadow-lg shadow-emerald-300/10"
                : ""
            }`}
          >
            {isCompleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
            ) : completed ? (
              "✓"
            ) : (
              "○"
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold ${
                completed
                  ? "text-neutral-500 line-through"
                  : "text-white"
              }`}
            >
              {task.title}
            </h3>

            {category && (
              <span className="rounded-full border border-amber-300/10 bg-amber-300/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-300/70">
                {category.label}
              </span>
            )}
          </div>

          {task.description && (
            <p
              className={`mt-2 text-sm leading-6 ${
                completed
                  ? "text-neutral-700"
                  : "text-neutral-500"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {!completed && (
              <>
                <span className="text-amber-300/70">
                  +10 XP
                </span>

                <span className="text-amber-300/70">
                  +5 Currency
                </span>

                {category && (
                  <span className="text-neutral-600">
                    → {category.attribute}
                  </span>
                )}
              </>
            )}

            {completed && task.completedAt && (
              <span className="text-neutral-700">
                Completed{" "}
                {new Date(
                  task.completedAt
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={isDeleting}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400 transition hover:border-amber-300/20 hover:text-amber-200 disabled:opacity-50"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(task._id)}
            disabled={isDeleting}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400 transition hover:border-red-300/20 hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function EmptyQuests() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 text-2xl text-amber-300">
        ✦
      </div>

      <h2 className="mt-5 text-xl font-semibold">
        Your quest board is empty.
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
        Create your first quest and turn an everyday action into
        character progression.
      </p>

      <p className="mt-5 text-xs uppercase tracking-wider text-neutral-700">
        Create a quest using the panel →
      </p>
    </div>
  );
}

export default Tasks;