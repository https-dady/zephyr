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

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-8">
        {/* LEFT — Brand */}
        <Link
          to="/dashboard"
          className="flex w-fit items-center gap-3"
          aria-label="Life RPG Dashboard"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-lg text-amber-300">
            ✦
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-wide text-white">
              LIFE RPG
            </p>

            <p className="text-xs text-neutral-500">
              Turn actions into progression
            </p>
          </div>
        </Link>

        {/* CENTER — Navigation */}
        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  active
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Logged-in User */}
        <div className="flex justify-end">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-xl bg-white/5 sm:w-32" />
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1.5 transition hover:border-amber-300/20 hover:bg-white/[0.05] sm:px-3"
                aria-label={`Open ${user?.name || "your"} profile`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-sm font-semibold text-amber-200">
                  {userInitial}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-28 truncate text-xs font-medium text-neutral-200">
                    {user?.name || "Adventurer"}
                  </p>

                  <p className="text-[10px] text-amber-300/60">
                    LVL {user?.level || 1}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-400 transition hover:border-amber-300/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:block"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div className="border-t border-white/5 px-4 py-3 md:hidden">
        <nav
          className="flex gap-2 overflow-x-auto"
          aria-label="Mobile navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs transition ${
                  active
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-500 transition hover:text-white disabled:opacity-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;