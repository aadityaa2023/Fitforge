// App.jsx — Root routing with auth guard
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, overflow: "auto", minHeight: "100vh" }}>
        {children}
      </Box>
    </Box>
  );
}

export default function App() {
  const [syncToast, setSyncToast] = useState({ open: false, count: 0 });

  useEffect(() => {
    const handleSync = (e) => {
      setSyncToast({ open: true, count: e.detail });
    };
    window.addEventListener('offline-sync-success', handleSync);
    return () => window.removeEventListener('offline-sync-success', handleSync);
  }, []);

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

      <Snackbar
        open={syncToast.open}
        autoHideDuration={5000}
        onClose={() => setSyncToast({ ...syncToast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Back online! Synced {syncToast.count} offline workout{syncToast.count > 1 ? 's' : ''} to the server.
        </Alert>
      </Snackbar>
    </AuthProvider>
  );
}
