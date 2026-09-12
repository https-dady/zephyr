import { AnimatePresence, motion } from "framer-motion";

function RPGFeedback({
  type = "xp",
  value,
  label,
  show = false,
}) {
  const config = {
    xp: {
      icon: "✦",
      text: label || "XP Earned",
      valuePrefix: "+",
      valueSuffix: " XP",
      accent: "text-amber-300",
      glow: "shadow-amber-400/10",
    },

    currency: {
      icon: "◈",
      text: label || "Currency Earned",
      valuePrefix: "+",
      valueSuffix: "",
      accent: "text-amber-200",
      glow: "shadow-amber-400/10",
    },

    streak: {
      icon: "🔥",
      text: label || "Streak Updated",
      valuePrefix: "",
      valueSuffix: " days",
      accent: "text-orange-300",
      glow: "shadow-orange-400/10",
    },

    levelup: {
      icon: "◆",
      text: label || "Level Up",
      valuePrefix: "Level ",
      valueSuffix: "",
      accent: "text-amber-200",
      glow: "shadow-amber-400/15",
    },
  };

  const selected = config[type] || config.xp;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.88,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -26,
            scale: 0.96,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="pointer-events-none fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2"
          role="status"
          aria-live="polite"
        >
          <div
            className={`relative min-w-[150px] overflow-hidden rounded-2xl border border-amber-300/15 bg-neutral-950/95 px-5 py-4 text-center shadow-2xl backdrop-blur-md ${selected.glow}`}
          >
            <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-32 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: [0, 1, 0.8],
                scale: [0.5, 1.15, 1],
              }}
              transition={{
                duration: 0.45,
              }}
              className={`relative text-xl ${selected.accent}`}
            >
              {selected.icon}
            </motion.div>

            <p className="relative mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              {selected.text}
            </p>

            <p
              className={`relative mt-1 text-lg font-bold ${selected.accent}`}
            >
              {selected.valuePrefix}
              {value}
              {selected.valueSuffix}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RPGFeedback;