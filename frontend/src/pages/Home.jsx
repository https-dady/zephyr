import { motion } from "framer-motion";
import Container from "../components/Container";
import Button from "../components/Button";

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]" />
        <div className="absolute right-[-180px] top-[420px] h-[420px] w-[420px] rounded-full bg-amber-500/5 blur-[130px]" />
        <div className="absolute bottom-[-180px] left-[-120px] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[130px]" />
      </div>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative">
        <Container className="flex min-h-[88vh] items-center py-20 sm:py-24 lg:py-28">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            {/* LEFT CONTENT */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-medium tracking-wide text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
                TURN YOUR LIFE INTO AN RPG
              </div>

              <h1 className="text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
                Your everyday
                <span className="block text-amber-300">quests matter.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg">
                Turn the things you already need to do into meaningful quests.
                Complete tasks, earn XP, build your attributes, maintain your
                streak and progress your character as you move through real
                life.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  to="/signup"
                  className="bg-amber-300 text-neutral-950 hover:bg-amber-200 hover:shadow-[0_0_28px_rgba(252,211,77,0.16)]"
                >
                  Start Your Journey
                </Button>

                <Button
                  to="/login"
                  variant="secondary"
                  className="border-neutral-700 bg-neutral-900/70 text-white hover:border-amber-300/30 hover:bg-neutral-800"
                >
                  Continue Your Journey
                </Button>
              </div>
            </motion.div>

            {/* RPG CHARACTER PREVIEW */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="absolute inset-10 rounded-full bg-amber-300/10 blur-[90px]" />

              <div className="relative rounded-[30px] border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                      RPG Preview
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Your Character
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      Start at Level 1
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-amber-200/60">
                      Level
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-amber-200">
                      01
                    </p>
                  </div>
                </div>

                {/* Character Preview */}
                <div className="mt-7 rounded-3xl border border-white/8 bg-black/30 p-6">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-2xl text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.08)]">
                      ✦
                    </div>

                    <div>
                      <p className="text-sm font-medium text-white">
                        New Adventurer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        Every completed task moves your character forward.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">
                        Your progression
                      </span>

                      <span className="text-neutral-600">
                        Earn XP through quests
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "34%" }}
                        transition={{
                          duration: 1.2,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-amber-300"
                      />
                    </div>
                  </div>
                </div>

                {/* RPG Concepts */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      title: "Attributes",
                      text: "Build your stats through your actions.",
                    },
                    {
                      title: "Streak",
                      text: "Keep showing up and stay consistent.",
                    },
                    {
                      title: "XP & Levels",
                      text: "Turn completed tasks into progression.",
                    },
                    {
                      title: "Rewards",
                      text: "Earn and unlock virtual rewards.",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.35 + index * 0.08,
                      }}
                      className="rounded-2xl border border-white/7 bg-white/[0.025] p-4"
                    >
                      <p className="text-sm font-medium text-neutral-200">
                        {item.title}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating feedback */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-amber-300/15 bg-neutral-900/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white">
                      Quest Complete
                    </p>

                    <p className="mt-0.5 text-[11px] text-amber-300">
                      + XP • Progress made
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section className="border-y border-white/6 bg-white/[0.015] py-24 sm:py-28">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/70">
              The Loop
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Real life becomes your progression system.
            </h2>

            <p className="mt-5 text-sm leading-7 text-neutral-500 sm:text-base">
              The goal is simple: take the things you already want to
              accomplish and give them the feeling of moving your character
              forward.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create a Quest",
                text: "Add the real-world task you want to accomplish and give it a place in your journey.",
              },
              {
                number: "02",
                title: "Complete & Progress",
                text: "Finish your task and let the system handle XP, attributes, streak progression and rewards.",
              },
              {
                number: "03",
                title: "Keep Leveling",
                text: "Build momentum over time as your completed actions shape your character progression.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group rounded-3xl border border-white/8 bg-neutral-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/15 hover:bg-neutral-900/80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-300">
                    {item.number}
                  </span>

                  <span className="h-px w-12 bg-white/10 transition-all duration-300 group-hover:w-16 group-hover:bg-amber-300/30" />
                </div>

                <h3 className="mt-8 text-xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="relative overflow-hidden py-28 sm:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/8 blur-[120px]" />

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[34px] border border-amber-300/15 bg-neutral-900/80 px-6 py-12 text-center shadow-2xl backdrop-blur-xl sm:px-10 sm:py-16 lg:px-20 lg:py-20"
          >
            {/* Decorative glows */}
            <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-48 w-48 rounded-full bg-amber-300/5 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-56 w-56 rounded-full bg-orange-400/5 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-xl text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.08)]">
                ✦
              </div>

              <p className="mt-7 text-xs font-medium uppercase tracking-[0.22em] text-amber-300/70">
                Your journey starts here
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Make progress feel
                <span className="block text-amber-300">
                  worth coming back to.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base sm:leading-8">
                Every completed task can become another step forward. Build
                your XP, strengthen your attributes, protect your streak and
                work toward the rewards waiting further along your journey.
              </p>

              {/* CTA Highlights */}
              <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  {
                    title: "Earn XP",
                    text: "Turn completed quests into progress.",
                  },
                  {
                    title: "Build Your Stats",
                    text: "Let your actions shape your attributes.",
                  },
                  {
                    title: "Stay On Track",
                    text: "Keep your streak alive and keep moving.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/7 bg-black/20 px-4 py-4 text-left"
                  >
                    <p className="text-sm font-medium text-neutral-200">
                      {item.title}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  to="/signup"
                  className="bg-amber-300 px-7 text-neutral-950 hover:bg-amber-200 hover:shadow-[0_0_32px_rgba(252,211,77,0.18)]"
                >
                  Begin Your Adventure
                </Button>

                <Button
                  to="/login"
                  variant="secondary"
                  className="border-neutral-700 bg-neutral-950/70 px-7 hover:border-amber-300/30 hover:bg-neutral-900"
                >
                  I Already Have an Account
                </Button>
              </div>

              <p className="mt-7 text-xs text-neutral-600">
                Start at Level 1. Complete your first quest. Build from there.
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}

export default Home;