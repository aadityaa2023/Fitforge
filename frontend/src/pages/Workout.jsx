// pages/Workout.jsx — Live workout screen with Voice AI Coach
import { useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button, Select,
  MenuItem, FormControl, InputLabel, Divider, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Snackbar, Alert, Tooltip, Switch, FormControlLabel, IconButton,
  Slider
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { motion, AnimatePresence } from "framer-motion";
import CameraFeed from "../components/CameraFeed";
import RepCounter from "../components/RepCounter";
import FeedbackBanner from "../components/FeedbackBanner";
import { workoutApi } from "../services/auth";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import TimerIcon from "@mui/icons-material/Timer";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CalculateIcon from "@mui/icons-material/Calculate";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import PlateCalculator from "../components/PlateCalculator";
import { useVoiceCoach } from "../hooks/useVoiceCoach";
import { saveWorkoutOffline } from "../utils/offlineSync";

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
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [restTimerOpen, setRestTimerOpen] = useState(false);
  const [restTarget, setRestTarget] = useState(60);
  const [restElapsed, setRestElapsed] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const restIntervalRef = useRef(null);

  const [lastResult, setLastResult] = useState(null);

  // Voice coach state — on by default so it "wows" on first demo
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastSpokenFeedback, setLastSpokenFeedback] = useState("");

  const repCountRef = useRef(0);

  // Voice AI Coach hook
  const { speak, announceExerciseStart, processPoseResult, announceWorkoutEnd, stop: stopVoice } =
    useVoiceCoach(voiceEnabled);

  const handlePoseResult = useCallback(
    (data) => {
      if (!data.detected) return;
      setPoseData(data);
      repCountRef.current = data.rep_count ?? 0;

      if (data.feedback?.length > 0) {
        setFeedbackLog((prev) => {
          const last = prev[prev.length - 1];
          if (last !== data.feedback[0]) return [...prev.slice(-19), data.feedback[0]];
          return prev;
        });
        // Show what the coach just said in the UI
        if (data.feedback[0] !== lastSpokenFeedback) {
          setLastSpokenFeedback(data.feedback[0]);
        }
      }
      if (data.form_score != null) {
        setFormScores((prev) => [...prev.slice(-49), data.form_score]);
      }

      // Feed result to voice coach
      processPoseResult(data);
    },
    [processPoseResult, lastSpokenFeedback]
  );

  const startWorkout = () => {
    setIsRunning(true);
    setElapsed(0);
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    setLastSpokenFeedback("");
    repCountRef.current = 0;
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    announceExerciseStart(exercise);
  };

  const resumeWorkout = () => {
    if (isResting) stopRest();
    setIsRunning(true);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    speak("Resuming, let's keep going!");
  };

  const stopWorkout = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    stopVoice();
  };

  const startRest = () => {
    stopWorkout();
    setIsResting(true);
    setRestElapsed(0);
    setRestTimerOpen(true);
    speak(`Resting for ${restTarget} seconds. Take a breather.`);

    restIntervalRef.current = setInterval(() => {
      setRestElapsed((p) => {
        if (p + 1 >= restTarget) {
          stopRest(true);
          return p + 1;
        }
        return p + 1;
      });
    }, 1000);
  };

  const stopRest = (autoFinished = false) => {
    clearInterval(restIntervalRef.current);
    setIsResting(false);
    setRestTimerOpen(false);
    setRestElapsed(0);
    if (autoFinished) {
      speak("Rest complete. Let's get back to work!", { rate: 1.05, pitch: 1.1, priority: true });
    }
  };

  const resetWorkout = () => {
    stopWorkout();
    stopRest();
    setElapsed(0);
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    setLastSpokenFeedback("");
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

      // Announce end via voice before saving
      announceWorkoutEnd(repCountRef.current);

      const payload = {
        exercise,
        reps: repCountRef.current,
        duration_seconds: elapsed,
        avg_form_score: avgFormScore,
        feedback_log: feedbackLog.slice(-10),
        perfect_reps: perfectReps,
      };

      const result = await workoutApi.completeWorkout(payload);
      setLastResult(result);
      setSummaryOpen(true);
      resetWorkout();
    } catch (err) {
      if (!navigator.onLine || err.message === "Network Error" || err.code === "ERR_NETWORK") {
        saveWorkoutOffline({
          exercise,
          reps: repCountRef.current,
          duration_seconds: elapsed,
          avg_form_score: avgFormScore,
          feedback_log: feedbackLog.slice(-10),
          perfect_reps: perfectReps,
        });
        setSnack({ open: true, message: "Offline. Workout saved locally and will sync later!", severity: "info" });
        setSummaryOpen(true);
        resetWorkout();
      } else {
        setSnack({ open: true, message: "Failed to save workout", severity: "error" });
      }
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>AI Workout Coach</Typography>
          <Typography color="text.secondary">Real-time pose analysis &amp; rep counting</Typography>
        </Box>

        {/* Right side — Voice toggle + timer */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Voice AI Coach toggle */}
          <Tooltip title={voiceEnabled ? "Voice Coach is ON — click to mute" : "Voice Coach is OFF — click to enable"}>
            <Box
              id="voice-coach-toggle"
              onClick={() => {
                if (voiceEnabled) stopVoice();
                setVoiceEnabled((v) => !v);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 99,
                cursor: "pointer",
                background: voiceEnabled
                  ? "linear-gradient(135deg, rgba(124,77,255,0.2), rgba(0,230,118,0.1))"
                  : "rgba(255,255,255,0.04)",
                border: voiceEnabled
                  ? "1px solid rgba(124,77,255,0.45)"
                  : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.25s ease",
                "&:hover": {
                  border: "1px solid rgba(124,77,255,0.7)",
                  background: "linear-gradient(135deg, rgba(124,77,255,0.25), rgba(0,230,118,0.15))",
                },
              }}
            >
              <AnimatePresence mode="wait">
                {voiceEnabled ? (
                  <motion.div
                    key="on"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RecordVoiceOverIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="off"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VolumeOffIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: voiceEnabled ? "secondary.main" : "text.secondary" }}
              >
                {voiceEnabled ? "Coach ON" : "Coach OFF"}
              </Typography>
            </Box>
          </Tooltip>

          {/* Timer chip */}
          <Chip
            icon={<TimerIcon fontSize="small" sx={{ color: isRunning ? "primary.main" : "text.secondary" }} />}
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

          {/* Plate Calculator Button */}
          <Tooltip title="Plate Calculator">
            <IconButton onClick={() => setPlateCalcOpen(true)} sx={{ bgcolor: "rgba(255,255,255,0.08)" }}>
              <CalculateIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
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
                      <MenuItem key={ex.value} value={ex.value} sx={{ display: "flex", gap: 1 }}>
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

              {/* Feedback banner */}
              <Box mt={2}>
                <FeedbackBanner feedback={isRunning ? (poseData?.feedback || []) : []} />
              </Box>

              {/* Voice coach "now speaking" indicator */}
              <AnimatePresence>
                {voiceEnabled && isRunning && lastSpokenFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: "rgba(124,77,255,0.1)",
                        border: "1px solid rgba(124,77,255,0.25)",
                      }}
                    >
                      {/* Animated sound-wave bars */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                            style={{
                              width: 3,
                              height: 16,
                              borderRadius: 99,
                              background: "#7C4DFF",
                              transformOrigin: "center",
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="secondary.main" fontWeight={600}>
                        Coach: &quot;{lastSpokenFeedback}&quot;
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

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
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {!isRunning && elapsed === 0 ? (
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
              ) : !isRunning && elapsed > 0 ? (
                <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
                  <Button
                    id="resume-workout-btn"
                    variant="contained"
                    size="large"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={resumeWorkout}
                    sx={{ flex: 1, py: 1.5 }}
                  >
                    Resume
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
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: "100%" }}>
                  <Button
                    id="stop-workout-btn"
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={stopWorkout}
                    sx={{ flex: 1, py: 1.5 }}
                  >
                    Pause
                  </Button>
                  <Button
                    id="rest-btn"
                    variant="outlined"
                    size="large"
                    startIcon={<HourglassEmptyIcon />}
                    onClick={startRest}
                    sx={{ flex: 1, py: 1.5, borderColor: "rgba(255,255,255,0.2)" }}
                  >
                    Rest
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
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Finish"}
                  </Button>
                </Box>
              )}
              
              {(isRunning || elapsed > 0) && (
                <Button
                  id="reset-workout-btn"
                  variant="outlined"
                  size="large"
                  fullWidth
                  sx={{ py: 1, borderColor: "rgba(255,255,255,0.1)", color: "text.secondary" }}
                  onClick={resetWorkout}
                  startIcon={<RestartAltIcon />}
                >
                  Reset Entire Workout
                </Button>
              )}
            </Box>

            {/* Tips + Voice Coach info */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  mb={1}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <LightbulbIcon fontSize="small" /> TIPS
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={voiceEnabled ? 2 : 0}>
                  {exercise === "squat" && "Keep chest up, drive through heels, knees track toes."}
                  {exercise === "pushup" && "Keep core tight, elbows at 45°, chest to floor."}
                  {exercise === "lunge" && "Step far enough, front knee over ankle, torso upright."}
                  {exercise === "curl" && "Keep elbows fixed, full range of motion, controlled descent."}
                </Typography>

                {/* Voice coach description */}
                {voiceEnabled && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(124,77,255,0.08)",
                      border: "1px solid rgba(124,77,255,0.2)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "secondary.main", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <RecordVoiceOverIcon sx={{ fontSize: 14 }} /> Voice AI Coach Active
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      I will announce form corrections, rep milestones, and motivational cues out loud.
                    </Typography>
                  </Box>
                )}
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
        PaperProps={{
          sx: {
            borderRadius: 4,
            minWidth: 340,
            background: "rgba(18,18,26,0.99)",
            border: "1px solid rgba(0,230,118,0.2)",
          },
        }}
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
                  <Typography
                    variant="body2"
                    color="secondary.main"
                    fontWeight={700}
                    mb={1}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}
                  >
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
              <Typography
                variant="body2"
                color="text.secondary"
                mt={2}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}
              >
                Streak: <LocalFireDepartmentIcon fontSize="small" /> {lastResult.new_streak}{" "}
                {lastResult.new_streak === 1 ? "day" : "days"}
              </Typography>
            </Box>
          )}
          {!lastResult && !navigator.onLine && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CloudOffIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h5" fontWeight={800} color="primary.main" mb={1}>
                Workout Saved Offline!
              </Typography>
              <Typography color="text.secondary">
                You are currently offline. Your data has been securely saved on your device and will automatically sync the next time you connect.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setSummaryOpen(false);
              navigate("/dashboard");
            }}
            variant="contained"
            fullWidth
          >
            View Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rest Timer Dialog */}
      <Dialog 
        open={restTimerOpen} 
        onClose={() => stopRest(false)}
        PaperProps={{
          sx: { background: "rgba(18,18,26,0.98)", borderRadius: 4, minWidth: 280, textAlign: "center", p: 2 }
        }}
      >
        <DialogTitle sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
          <HourglassEmptyIcon sx={{ fontSize: 40, color: "secondary.main" }} />
          <Typography variant="h5" fontWeight={800}>Rest Time</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            <CircularProgress 
              variant="determinate" 
              value={100} 
              size={120} 
              sx={{ color: "rgba(255,255,255,0.05)", position: "absolute" }} 
              thickness={4} 
            />
            <CircularProgress 
              variant="determinate" 
              value={(restElapsed / restTarget) * 100} 
              size={120} 
              color="secondary" 
              thickness={4} 
            />
            <Box
              sx={{
                top: 0, left: 0, bottom: 0, right: 0,
                position: "absolute",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Typography variant="h4" fontWeight={900} color="text.primary">
                {restTarget - restElapsed}s
              </Typography>
            </Box>
          </Box>
          <Typography color="text.secondary" gutterBottom>
            Adjust Target Duration (s)
          </Typography>
          <Slider
            value={restTarget}
            onChange={(_, v) => setRestTarget(v)}
            step={15}
            marks
            min={15}
            max={180}
            color="secondary"
            sx={{ px: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => stopRest(false)} variant="contained" size="large" fullWidth>
            Skip Rest
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>
          {snack.message}
        </Alert>
      </Snackbar>

      <PlateCalculator open={plateCalcOpen} onClose={() => setPlateCalcOpen(false)} />
    </Box>
  );
}
