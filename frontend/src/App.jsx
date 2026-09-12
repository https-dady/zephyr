import { useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";

const SEO_CONFIG = {
  "/": {
    title: "Life RPG — Turn Everyday Life Into Your Next Level",
    description:
      "Life RPG turns everyday tasks into quests, XP, character progression, streaks, and rewards.",
    robots: "index, follow",
  },

  "/login": {
    title: "Login — Life RPG",
    description:
      "Log in to your Life RPG account and continue your quests, progression, streaks, and character journey.",
    robots: "noindex, nofollow",
  },

  "/signup": {
    title: "Create Your Character — Life RPG",
    description:
      "Create your Life RPG account and turn everyday tasks into quests, XP, progression, streaks, and rewards.",
    robots: "noindex, nofollow",
  },

  "/forgot-password": {
    title: "Recover Your Account — Life RPG",
    description:
      "Securely recover your Life RPG account and return to your quests and character progression.",
    robots: "noindex, nofollow",
  },

  "/verify-email": {
    title: "Verify Your Email — Life RPG",
    description:
      "Verify your Life RPG account email to continue your journey.",
    robots: "noindex, nofollow",
  },

  "/dashboard": {
    title: "Dashboard — Life RPG",
    description:
      "View your Life RPG progression, quests, XP, attributes, streaks, and global leaderboard.",
    robots: "noindex, nofollow",
  },

  "/tasks": {
    title: "Quests — Life RPG",
    description:
      "Manage your Life RPG quests, complete tasks, earn XP, and build your character.",
    robots: "noindex, nofollow",
  },

  "/rewards": {
    title: "Rewards — Life RPG",
    description:
      "Explore Life RPG rewards and use your earned currency to unlock virtual items, themes, and badges.",
    robots: "noindex, nofollow",
  },

  "/profile": {
    title: "Profile — Life RPG",
    description:
      "View your Life RPG character, progression, attributes, streaks, and earned rewards.",
    robots: "noindex, nofollow",
  },
};

function updateMetaTag(name, content) {
  let element = document.head.querySelector(
    `meta[name="${name}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function updateCanonical(pathname) {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]'
  );

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  const origin = window.location.origin;

  canonical.setAttribute(
    "href",
    `${origin}${pathname === "/" ? "/" : pathname}`
  );
}

function PageSEO() {
  const location = useLocation();

  useEffect(() => {
    const config =
      SEO_CONFIG[location.pathname] ||
      SEO_CONFIG["/"];

    document.title = config.title;

    updateMetaTag(
      "description",
      config.description
    );

    updateMetaTag(
      "robots",
      config.robots
    );

    updateCanonical(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  const location = useLocation();

  return (
    <>
      <PageSEO />

      <AnimatePresence
        mode="sync"
        initial={false}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="min-h-screen"
        >
          <Routes location={location}>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/verify-email"
              element={<VerifyEmail />}
            />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/tasks"
                element={<Tasks />}
              />

              <Route
                path="/rewards"
                element={<Rewards />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;