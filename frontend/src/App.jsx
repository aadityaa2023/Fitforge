// App.jsx — Root routing with auth guard
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import Progress from "./pages/Progress";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import AiPlanner from "./pages/AiPlanner";

// Protected route wrapper
function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress size={48} sx={{ color: "primary.main" }} />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, overflow: "auto", minHeight: "100vh" }}>
        {children}
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={<ProtectedLayout><Dashboard /></ProtectedLayout>}
          />
          <Route
            path="/workout"
            element={<ProtectedLayout><Workout /></ProtectedLayout>}
          />
          <Route
            path="/progress"
            element={<ProtectedLayout><Progress /></ProtectedLayout>}
          />
          <Route
            path="/achievements"
            element={<ProtectedLayout><Achievements /></ProtectedLayout>}
          />
          <Route
            path="/leaderboard"
            element={<ProtectedLayout><Leaderboard /></ProtectedLayout>}
          />
          <Route
            path="/ai-planner"
            element={<ProtectedLayout><AiPlanner /></ProtectedLayout>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
