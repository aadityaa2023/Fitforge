// pages/Workout.jsx — Live workout screen with camera, rep counter, and feedback
import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button, Select,
  MenuItem, FormControl, InputLabel, Divider, Chip, CircularProgress,
  Dialog, DialogContent, DialogTitle, DialogActions,
  Snackbar, Alert,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { motion } from "framer-motion";
import CameraFeed from "../components/CameraFeed";
import RepCounter from "../components/RepCounter";
import FeedbackBanner from "../components/FeedbackBanner";
import { workoutApi } from "../services/auth";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import TimerIcon from "@mui/icons-material/Timer";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const EXERCISES = [
  { value: "squat",  label: "Squats",      icon: <DirectionsRunIcon /> },
  { value: "pushup", label: "Push-Ups",    icon: <FitnessCenterIcon /> },
  { value: "lunge",  label: "Lunges",      icon: <DirectionsRunIcon /> },
  { value: "curl",   label: "Bicep Curls", icon: <FitnessCenterIcon /> },
];

export default function Workout() {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [exercise, setExercise] = useState(location.state?.exercise || "squat");
  const [isRunning, setIsRunning] = useState(false);
  const [poseData, setPoseData] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [formScores, setFormScores] = useState([]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const repCountRef = useRef(0);

  const handlePoseResult = useCallback((data) => {
    if (!data.detected) return;
    setPoseData(data);
    repCountRef.current = data.rep_count ?? 0;

    if (data.feedback?.length > 0) {
      setFeedbackLog((prev) => {
        const last = prev[prev.length - 1];
        if (last !== data.feedback[0]) return [...prev.slice(-19), data.feedback[0]];
        return prev;
      });
    }
    if (data.form_score != null) {
      setFormScores((prev) => [...prev.slice(-49), data.form_score]);
    }
  }, []);

  const startWorkout = () => {
    setIsRunning(true);
    setElapsed(0);
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    repCountRef.current = 0;
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  };

  const stopWorkout = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const resetWorkout = () => {
    stopWorkout();
    setElapsed(0);
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    repCountRef.current = 0;
  };

  const saveWorkout = async () => {
    setSaving(true);
    try {
      const avgFormScore =
        formScores.length > 0
          ? formScores.reduce((a, b) => a + b, 0) / formScores.length
          : 0;
      const perfectReps = formScores.filter((s) => s >= 0.85).length;

      const result = await workoutApi.completeWorkout({
        exercise,
        reps: repCountRef.current,
        duration_seconds: elapsed,
        avg_form_score: avgFormScore,
        feedback_log: feedbackLog.slice(-10),
        perfect_reps: perfectReps,
      });
      setLastResult(result);
      setSummaryOpen(true);
      resetWorkout();
    } catch {
      setSnack({ open: true, message: "Failed to save workout", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const avgForm =
    formScores.length > 0
      ? Math.round((formScores.reduce((a, b) => a + b, 0) / formScores.length) * 100)
      : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>AI Workout Coach</Typography>
          <Typography color="text.secondary">Real-time pose analysis & rep counting</Typography>
        </Box>
        <Chip
          icon={<TimerIcon fontSize="small" sx={{ color: isRunning ? 'primary.main' : 'text.secondary' }} />}
          label={isRunning ? formatTime(elapsed) : "Ready"}
          sx={{
            bgcolor: isRunning ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.06)",
            color: isRunning ? "primary.main" : "text.secondary",
            fontWeight: 700,
            fontSize: "1rem",
            px: 1,
            height: 40,
            border: isRunning ? "1px solid rgba(0,230,118,0.4)" : "1px solid transparent",
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Camera + Feedback — left pane */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              {/* Exercise selector */}
              {!isRunning && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="exercise-label">Exercise</InputLabel>
                  <Select
                    labelId="exercise-label"
                    id="exercise-select"
                    value={exercise}
                    label="Exercise"
                    onChange={(e) => setExercise(e.target.value)}
                  >
                    {EXERCISES.map((ex) => (
                      <MenuItem key={ex.value} value={ex.value} sx={{ display: 'flex', gap: 1 }}>
                        {ex.icon} {ex.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {isRunning ? (
                <CameraFeed exercise={exercise} onPoseResult={handlePoseResult} />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "4/3",
                    borderRadius: 3,
                    border: "2px dashed rgba(255,255,255,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    background: "rgba(0,0,0,0.3)",
                    color: "text.secondary",
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: "3rem", mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>Camera ready</Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" px={3}>
                    Select an exercise and press Start to begin AI-powered analysis
                  </Typography>
                </Box>
              )}

              {/* Feedback banner — below camera */}
              <Box mt={2}>
                <FeedbackBanner feedback={isRunning ? (poseData?.feedback || []) : []} />
              </Box>

              {/* Joint angles display */}
              {isRunning && poseData?.angles && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
                  {Object.entries(poseData.angles).map(([joint, angle]) => (
                    <Chip
                      key={joint}
                      label={`${joint}: ${angle}°`}
                      size="small"
                      sx={{ bgcolor: "rgba(124,77,255,0.15)", color: "secondary.main", fontWeight: 600 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Controls & Stats — right pane */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Rep Counter card */}
            <Card>
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <motion.div
                  animate={poseData?.rep_count !== undefined ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <RepCounter
                    count={poseData?.rep_count ?? 0}
                    stage={poseData?.stage ?? "up"}
                    exercise={exercise}
                  />
                </motion.div>
              </CardContent>
            </Card>

            {/* Form Score card */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>
                  SESSION STATS
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      {avgForm}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Avg Form</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="h4" fontWeight={800} color="secondary.main">
                      {formatTime(elapsed)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Control buttons */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {!isRunning ? (
                <Button
                  id="start-workout-btn"
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={startWorkout}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Start Workout
                </Button>
              ) : (
                <>
                  <Button
                    id="stop-workout-btn"
                    variant="outlined"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={stopWorkout}
                    sx={{ flex: 1, py: 1.5, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    Pause
                  </Button>
                  <Button
                    id="save-workout-btn"
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={saveWorkout}
                    disabled={saving || repCountRef.current === 0}
                    sx={{ flex: 1, py: 1.5 }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Save & Finish"}
                  </Button>
                </>
              )}
              {(isRunning || elapsed > 0) && (
                <Button
                  id="reset-workout-btn"
                  variant="outlined"
                  size="large"
                  sx={{ px: 2, borderColor: "rgba(255,255,255,0.1)", color: "text.secondary" }}
                  onClick={resetWorkout}
                >
                  <RestartAltIcon />
                </Button>
              )}
            </Box>

            {/* Tips */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LightbulbIcon fontSize="small" /> TIPS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exercise === "squat" && "Keep chest up, drive through heels, knees track toes."}
                  {exercise === "pushup" && "Keep core tight, elbows at 45°, chest to floor."}
                  {exercise === "lunge" && "Step far enough, front knee over ankle, torso upright."}
                  {exercise === "curl" && "Keep elbows fixed, full range of motion, controlled descent."}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Save Success Dialog */}
      <Dialog
        id="workout-summary-dialog"
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, minWidth: 340, background: "rgba(18,18,26,0.99)", border: "1px solid rgba(0,230,118,0.2)" } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Typography variant="h5" fontWeight={800}>Workout Complete!</Typography>
        </DialogTitle>
        <DialogContent>
          {lastResult && (
            <Box sx={{ textAlign: "center", py: 1 }}>
              <Typography variant="h2" fontWeight={900} color="primary.main">
                +{lastResult.xp_earned} XP
              </Typography>
              <Typography color="text.secondary" mb={2}>earned this session</Typography>
              {lastResult.new_achievements?.length > 0 && (
                <Box>
                  <Typography variant="body2" color="secondary.main" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <EmojiEventsIcon fontSize="small" /> Achievement Unlocked!
                  </Typography>
                  {lastResult.new_achievements.map((a) => (
                    <Chip
                      key={a.id}
                      label={a.title}
                      icon={<EmojiEventsIcon />}
                      sx={{ bgcolor: "rgba(124,77,255,0.2)", color: "secondary.light", fontWeight: 700 }}
                    />
                  ))}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" mt={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                Streak: <LocalFireDepartmentIcon fontSize="small" /> {lastResult.new_streak} {lastResult.new_streak === 1 ? "day" : "days"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
          <Button onClick={() => { setSummaryOpen(false); navigate("/dashboard"); }} variant="contained" fullWidth>
            View Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
