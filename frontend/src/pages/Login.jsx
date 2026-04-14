// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#050505" }}>
      {/* Left side: Branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1.2,
          position: "relative",
          background: "linear-gradient(200deg, #111116 0%, #050505 100%)",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 8,
          borderRight: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <Box 
          sx={{ 
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.6, 
            backgroundImage: "radial-gradient(circle at 0% 0%, rgba(255, 87, 34, 0.15) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(255, 87, 34, 0.08) 0%, transparent 50%)" 
          }} 
        />
        
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 20px rgba(255, 87, 34, 0.4)" }}>
              <FitnessCenterIcon />
            </Box>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.03em" color="text.primary">
              FitForge
            </Typography>
          </Box>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
          <Typography variant="h2" fontWeight={800} mb={3} lineHeight={1.1} letterSpacing="-0.03em">
            Forged in Fire.<br/> Built for <Box component="span" sx={{ color: "primary.main" }}>Athletes</Box>.
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={500} lineHeight={1.5} sx={{ opacity: 0.8 }}>
            AI-powered pose analysis, real-time coaching feedback, and dynamic programming to ensure every rep counts.
          </Typography>
        </Box>
      </Box>

      {/* Right side: Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, md: 8 },
          position: "relative",
          background: "#0a0a0f",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 6 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <FitnessCenterIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">FitForge</Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} mb={1} letterSpacing="-0.02em">Welcome back</Typography>
            <Typography variant="body1" color="text.secondary" mb={5}>
              Enter your credentials to access your dashboard.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                id="login-email"
                name="email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <TextField
                  id="login-password"
                  name="password"
                  label="Password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                          {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                  <Link to="#" style={{ color: "#9CA3AF", fontSize: "0.85rem", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color="#fff"} onMouseOut={(e) => e.target.style.color="#9CA3AF"}>
                    Forgot your password?
                  </Link>
                </Box>
              </Box>

              <Button
                id="login-submit"
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{ py: 1.6, fontSize: "1rem", mt: 1, letterSpacing: "0.02em" }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
              </Button>
            </Box>

            <Typography variant="body2" textAlign="center" mt={5} color="text.secondary">
              Don&apos;t have an account?{" "}
              <Link to="/signup" style={{ color: "#FF5722", textDecoration: "none", fontWeight: 700 }}>
                Sign up free
              </Link>
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
