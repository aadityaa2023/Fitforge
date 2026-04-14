// pages/Dashboard.jsx — Main hub: XP, streak, recent workouts, quick start
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button, Divider,
  Skeleton, Chip, Avatar,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import XPBar from "../components/XPBar";
import StreakBadge from "../components/StreakBadge";
import { gamificationApi, workoutApi } from "../services/auth";
import BoltIcon from "@mui/icons-material/Bolt";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import EmojiEventsIcon2 from "@mui/icons-material/EmojiEvents";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";

const EXERCISE_META = {
  squat:  { label: "Squats",     icon: <DirectionsRunIcon />, color: "#7C4DFF" },
  pushup: { label: "Push-Ups",   icon: <FitnessCenterIcon />, color: "#00E676" },
  lunge:  { label: "Lunges",     icon: <DirectionsRunIcon />, color: "#ff9800" },
  curl:   { label: "Bicep Curls",icon: <FitnessCenterIcon />, color: "#2196f3" },
};

function StatCard({ label, value, icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
              <Typography variant="h4" fontWeight={800} color={color || "primary.main"}>
                {value ?? <Skeleton width={60} />}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: `${color || "#00E676"}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      gamificationApi.getProfile(),
      workoutApi.getHistory(1, 5),
      refreshUser(),
    ])
      .then(([prof, hist]) => {
        setProfile(prof);
        setHistory(hist);
      })
      .finally(() => setLoading(false));
  }, []);

  const xpToNext = profile?.xp_to_next_level;
  const currentXpMin = profile?.current_level_min_xp ?? 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>
            Welcome back,{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {user?.username ?? "Athlete"}
            </Box>
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            Ready to crush your workout today?
          </Typography>
        </Box>
      </motion.div>

      {/* XP + Streak row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="body2" color="text.secondary" mb={1.5} fontWeight={600}>
                Your Progress
              </Typography>
              <XPBar
                xp={profile?.xp ?? user?.xp ?? 0}
                level={profile?.level ?? user?.level ?? 0}
                levelName={profile?.level_name ?? user?.level_name ?? "Beginner"}
                xpToNext={xpToNext}
                currentLevelMinXp={currentXpMin}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <StreakBadge streak={profile?.streak ?? user?.streak ?? 0} size="large" />
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="caption" color="text.secondary">Achievements</Typography>
                <Typography variant="h5" fontWeight={800} color="secondary.main">
                  {profile?.achievements?.length ?? 0}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total XP" value={(profile?.xp ?? 0).toLocaleString()} icon={<BoltIcon />} color="#ffab40" delay={0.15} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Level" value={profile?.level_name ?? "Beginner"} icon={<WorkspacePremiumIcon />} color="#7C4DFF" delay={0.2} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Day Streak" value={`${profile?.streak ?? 0}`} icon={<LocalFireDepartmentIcon />} color="#ff9800" delay={0.25} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Achievements" value={`${profile?.achievements?.length ?? 0}/8`} icon={<EmojiEventsIcon2 />} color="#00E676" delay={0.3} />
        </Grid>
      </Grid>

      {/* Quick Start + Recent Workouts */}
      <Grid container spacing={3}>
        {/* Quick Start */}
        <Grid item xs={12} md={5}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Quick Start
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {Object.entries(EXERCISE_META).map(([key, meta]) => (
                    <Button
                      key={key}
                      id={`quickstart-${key}`}
                      variant="outlined"
                      startIcon={<Box sx={{ display: 'flex', alignItems: 'center' }}>{meta.icon}</Box>}
                      onClick={() => navigate("/workout", { state: { exercise: key } })}
                      sx={{
                        justifyContent: "flex-start",
                        borderColor: `${meta.color}44`,
                        color: meta.color,
                        "&:hover": { borderColor: meta.color, bgcolor: `${meta.color}12` },
                        py: 1.2,
                      }}
                    >
                      {meta.label}
                    </Button>
                  ))}
                </Box>
                <Button
                  id="goto-workout"
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2.5 }}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/workout")}
                >
                  Start Workout
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Workouts */}
        <Grid item xs={12} md={7}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Recent Workouts</Typography>
                  <Button size="small" onClick={() => navigate("/progress")} sx={{ color: "text.secondary" }}>
                    View all
                  </Button>
                </Box>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 1.5 }}>
                      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                    </Box>
                  ))
                ) : history.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <FitnessCenterIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                    <Typography color="text.secondary">No workouts yet. Start your first!</Typography>
                  </Box>
                ) : (
                  history.map((w) => {
                    const meta = EXERCISE_META[w.exercise] || { label: w.exercise, icon: <FitnessCenterIcon />, color: "#9e9e9e" };
                    return (
                      <Box
                        key={w.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          mb: 1,
                          borderRadius: 2,
                          bgcolor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                        }}
                      >
                        <Avatar sx={{ bgcolor: `${meta.color}22`, color: meta.color, width: 40, height: 40 }}>
                          {meta.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{meta.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {w.reps} reps · {Math.round(w.duration_seconds / 60)}m
                          </Typography>
                        </Box>
                        <Chip
                          label={`+${w.xp_earned} XP`}
                          size="small"
                          sx={{ bgcolor: "rgba(0,230,118,0.12)", color: "primary.main", fontWeight: 700 }}
                        />
                      </Box>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
