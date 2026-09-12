import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex w-full max-w-sm flex-col items-center"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-9 w-9 rounded-full border-2 border-white/10 border-t-amber-300"
            aria-label="Loading"
          />

          <p className="mt-4 text-sm text-white/45">
            Loading your adventure...
          </p>

          <div className="mt-6 w-full space-y-2">
            <div className="rpg-skeleton h-3 w-2/3 rounded" />
            <div className="rpg-skeleton h-3 w-full rounded" />
            <div className="rpg-skeleton h-3 w-4/5 rounded" />
          </div>
        </motion.div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;