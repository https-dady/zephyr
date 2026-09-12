import { motion } from "framer-motion";
import Container from "../components/Container";
import Button from "../components/Button";

const HERO_EASE = [0.22, 1, 0.36, 1];

const RPG_CONCEPTS = [
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
];

const HOW_IT_WORKS = [
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
];

const CTA_HIGHLIGHTS = [
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
];

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-180px] top-[420px] h-[420px] w-[420px] rounded-full bg-amber-500/5 blur-[130px]"
        />

        <motion.div
          animate={{
            scale: [1.05, 1, 1.05],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-180px] left-[-120px] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[130px]"
        />
      </div>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative">
        <Container className="flex min-h-[88vh] items-center py-20 sm:py-24 lg:py-28">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            {/* LEFT CONTENT */}

            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                ease: HERO_EASE,
              }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.94,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.08,
                  ease: HERO_EASE,
                }}
                whileHover={{
                  y: -2,
                }}
                className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/5 px-4 py-2 text-xs font-medium tracking-wide text-amber-200"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.65, 1, 0.65],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]"
                />

                TURN YOUR LIFE INTO AN RPG
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.65,
                  delay: 0.14,
                  ease: HERO_EASE,
                }}
                className="text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl"
              >
                Your everyday
                <span className="block text-amber-300">
                  quests matter.
                </span>
              </motion.h1>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.55,
                  delay: 0.24,
                  ease: HERO_EASE,
                }}
                className="mt-7 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg"
              >
                Turn the things you already need to do into meaningful quests.
                Complete tasks, earn XP, build your attributes, maintain your
                streak and progress your character as you move through real
                life.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.34,
                  ease: HERO_EASE,
                }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
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
              </motion.div>
            </motion.div>

            {/* RPG CHARACTER PREVIEW */}

            <motion.div
              initial={{
                opacity: 0,
                x: 30,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: HERO_EASE,
              }}
              className="relative mx-auto w-full max-w-xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.55, 0.8, 0.55],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-10 rounded-full bg-amber-300/10 blur-[90px]"
              />

              <motion.div
                whileHover={{
                  y: -4,
                }}
                transition={{
                  duration: 0.3,
                  ease: HERO_EASE,
                }}
                className="relative rounded-[30px] border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl transition-shadow duration-500 hover:border-white/15 hover:shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:p-8"
              >
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

                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      rotate: 2,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 16,
                    }}
                    className="rounded-2xl border border-amber-300/15 bg-amber-300/5 px-4 py-3 text-center"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-amber-200/60">
                      Level
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-amber-200">
                      01
                    </p>
                  </motion.div>
                </div>

                {/* Character Preview */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: 0.38,
                    ease: HERO_EASE,
                  }}
                  className="mt-7 rounded-3xl border border-white/8 bg-black/30 p-6 transition-colors duration-300 hover:border-amber-300/10 hover:bg-black/40"
                >
                  <div className="flex items-center gap-5">
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      whileHover={{
                        scale: 1.08,
                        rotate: 4,
                      }}
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-2xl text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.08)]"
                    >
                      ✦
                    </motion.div>

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
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: "34%",
                        }}
                        transition={{
                          duration: 1.2,
                          delay: 0.5,
                          ease: HERO_EASE,
                        }}
                        className="relative h-full rounded-full bg-amber-300"
                      >
                        <motion.div
                          animate={{
                            x: ["-100%", "300%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 2.5,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-y-0 w-1/3 skew-x-[-18deg] bg-white/25 blur-sm"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* RPG Concepts */}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {RPG_CONCEPTS.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: 0.45 + index * 0.08,
                        ease: HERO_EASE,
                      }}
                      whileHover={{
                        y: -3,
                      }}
                      className="group rounded-2xl border border-white/7 bg-white/[0.025] p-4 transition-colors duration-300 hover:border-amber-300/10 hover:bg-white/[0.04]"
                    >
                      <p className="text-sm font-medium text-neutral-200 transition-colors duration-200 group-hover:text-white">
                        {item.title}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                        {item.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Floating feedback */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.9,
                  ease: HERO_EASE,
                }}
                className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-amber-300/15 bg-neutral-900/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:block"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300"
                  >
                    ✓
                  </motion.div>

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
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.6,
              ease: HERO_EASE,
            }}
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
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={item.number}
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
                  amount: 0.25,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: HERO_EASE,
                }}
                whileHover={{
                  y: -5,
                }}
                className="group rounded-3xl border border-white/8 bg-neutral-900/50 p-6 transition-colors duration-300 hover:border-amber-300/15 hover:bg-neutral-900/80 hover:shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
              >
                <div className="flex items-center justify-between">
                  <motion.span
                    whileHover={{
                      x: 2,
                    }}
                    className="text-sm font-medium text-amber-300"
                  >
                    {item.number}
                  </motion.span>

                  <motion.span
                    initial={{
                      width: 48,
                    }}
                    whileHover={{
                      width: 64,
                    }}
                    className="h-px bg-white/10 transition-colors duration-300 group-hover:bg-amber-300/30"
                  />
                </div>

                <h3 className="mt-8 text-xl font-semibold text-white transition-colors duration-200 group-hover:text-amber-100">
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
          className="pointer-events-none absolute left-1/2 top-1/2 h-[430px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/8 blur-[120px]"
        />

        <Container>
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.985,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
              ease: HERO_EASE,
            }}
            className="relative overflow-hidden rounded-[34px] border border-amber-300/15 bg-neutral-900/80 px-6 py-12 text-center shadow-2xl backdrop-blur-xl transition-shadow duration-500 hover:border-amber-300/20 hover:shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:px-10 sm:py-16 lg:px-20 lg:py-20"
          >
            {/* Decorative glows */}

            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.35, 0.6, 0.35],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-[-80px] top-[-80px] h-48 w-48 rounded-full bg-amber-300/5 blur-3xl"
            />

            <motion.div
              animate={{
                scale: [1.08, 1, 1.08],
                opacity: [0.3, 0.55, 0.3],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-56 w-56 rounded-full bg-orange-400/5 blur-3xl"
            />

            <div className="relative mx-auto max-w-3xl">
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-xl text-amber-300 shadow-[0_0_30px_rgba(252,211,77,0.08)]"
              >
                ✦
              </motion.div>

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
                {CTA_HIGHLIGHTS.map((item, index) => (
                  <motion.div
                    key={item.title}
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
                    }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.07,
                      ease: HERO_EASE,
                    }}
                    whileHover={{
                      y: -3,
                    }}
                    className="group rounded-2xl border border-white/7 bg-black/20 px-4 py-4 text-left transition-colors duration-300 hover:border-amber-300/10 hover:bg-black/30"
                  >
                    <p className="text-sm font-medium text-neutral-200 transition-colors duration-200 group-hover:text-white">
                      {item.title}
                    </p>

                    <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>

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
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.15,
                  ease: HERO_EASE,
                }}
                className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"
              >
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
              </motion.div>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                whileInView={{
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.25,
                }}
                className="mt-7 text-xs text-neutral-600"
              >
                Start at Level 1. Complete your first quest. Build from there.
              </motion.p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}

export default Home;