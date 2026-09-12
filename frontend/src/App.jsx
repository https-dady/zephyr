import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;