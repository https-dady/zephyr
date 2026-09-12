import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Quests",
    path: "/tasks",
  },
  {
    label: "Rewards",
    path: "/rewards",
  },
  {
    label: "Profile",
    path: "/profile",
  },
];

function Navbar() {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileMenuId = useId();

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-8">
        {/* LEFT — Brand */}

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
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Link
            to="/dashboard"
            className="group flex w-fit items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label="Life RPG Dashboard"
          >
            <motion.div
              whileHover={{
                scale: 1.08,
                rotate: 4,
              }}
              whileTap={{
                scale: 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 16,
              }}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300"
              aria-hidden="true"
            >
              <motion.span
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ✦
              </motion.span>
            </motion.div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-wide text-white transition-colors duration-200 group-hover:text-amber-100">
                LIFE RPG
              </p>

              <p className="text-xs text-neutral-500 transition-colors duration-200 group-hover:text-neutral-400">
                Turn actions into progression
              </p>
            </div>
          </Link>
        </motion.div>

        {/* CENTER — Desktop Navigation */}

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item, index) => {
            const active = isActive(item.path);

            return (
              <motion.div
                key={item.path}
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
              >
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`group relative block rounded-lg px-4 py-2 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                    active
                      ? "bg-white/5 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">
                    {item.label}
                  </span>

                  <motion.span
                    initial={false}
                    animate={{
                      scaleX: active ? 1 : 0,
                      opacity: active ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute bottom-0 left-3 right-3 h-px origin-center rounded-full bg-amber-300"
                    aria-hidden="true"
                  />

                  {!active && (
                    <span
                      className="absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* RIGHT — Logged-in User */}

        <div className="flex justify-end">
          {loading ? (
            <div
              className="rpg-skeleton h-10 w-24 rounded-xl sm:w-32"
              role="status"
              aria-label="Loading account information"
            />
          ) : (
            <motion.div
              initial={{
                opacity: 0,
                x: 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <motion.div
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Link
                  to="/profile"
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 transition-colors duration-200 hover:border-amber-300/20 hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:px-3"
                  aria-label={`Open ${
                    user?.name || "your"
                  } profile`}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.08,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 16,
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-sm font-semibold text-amber-200"
                    aria-hidden="true"
                  >
                    {userInitial}
                  </motion.div>

                  <div className="hidden text-left sm:block">
                    <p className="max-w-28 truncate text-xs font-medium text-neutral-200 transition-colors duration-200 group-hover:text-white">
                      {user?.name || "Adventurer"}
                    </p>

                    <p className="text-[10px] text-amber-300/60">
                      LVL {user?.level || 1}
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
                className="rpg-button hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400 transition-colors hover:border-amber-300/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 lg:block"
                aria-label="Log out of Life RPG"
              >
                <span className="relative z-10">
                  Logout
                </span>
              </motion.button>

              {/* MOBILE MENU BUTTON */}

              <motion.button
                type="button"
                onClick={() =>
                  setMobileMenuOpen((current) => !current)
                }
                whileTap={{
                  scale: 0.94,
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-colors hover:border-amber-300/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 md:hidden"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileMenuId}
              >
                <span
                  className="flex flex-col gap-1"
                  aria-hidden="true"
                >
                  <motion.span
                    animate={{
                      rotate: mobileMenuOpen ? 45 : 0,
                      y: mobileMenuOpen ? 5 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="block h-px w-4 bg-current"
                  />

                  <motion.span
                    animate={{
                      opacity: mobileMenuOpen ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.15,
                    }}
                    className="block h-px w-4 bg-current"
                  />

                  <motion.span
                    animate={{
                      rotate: mobileMenuOpen ? -45 : 0,
                      y: mobileMenuOpen ? -5 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="block h-px w-4 bg-current"
                  />
                </span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* MOBILE NAVIGATION */}

      <div
        id={mobileMenuId}
        className={`border-t border-white/5 px-4 md:hidden ${
          mobileMenuOpen
            ? "block py-3"
            : "hidden"
        }`}
      >
        <nav
          className="flex flex-col gap-1"
          aria-label="Mobile navigation"
          aria-hidden={!mobileMenuOpen}
        >
          {NAV_ITEMS.map((item, index) => {
            const active = isActive(item.path);

            return (
              <motion.div
                key={item.path}
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: mobileMenuOpen ? 1 : 0,
                  x: mobileMenuOpen ? 0 : -6,
                }}
                transition={{
                  duration: 0.25,
                  delay: mobileMenuOpen
                    ? index * 0.04
                    : 0,
                }}
              >
                <Link
                  to={item.path}
                  onClick={handleMobileNavigation}
                  aria-current={
                    active ? "page" : undefined
                  }
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className={`group relative block rounded-lg px-3 py-3 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
                    active
                      ? "bg-white/5 text-white"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">
                    {item.label}
                  </span>

                  <motion.span
                    initial={false}
                    animate={{
                      scaleX: active ? 1 : 0,
                      opacity: active ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="absolute bottom-1 left-2.5 right-2.5 h-px origin-center bg-amber-300"
                    aria-hidden="true"
                  />

                  {!active && (
                    <span
                      className="absolute inset-0 rounded-lg bg-white/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* MOBILE LOGOUT */}

          <motion.button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            whileTap={{
              scale: 0.96,
            }}
            className="rpg-button mt-1 w-full rounded-lg border border-white/10 px-3 py-3 text-left text-sm text-neutral-500 transition-colors hover:border-amber-300/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Log out of Life RPG"
          >
            <span className="relative z-10">
              Logout
            </span>
          </motion.button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;