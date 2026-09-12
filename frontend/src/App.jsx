import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Authenticated Routes */}
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/tasks" element={<div>Tasks</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
      <Route path="/rewards" element={<div>Rewards</div>} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
    </Routes>
  );
}

export default App;