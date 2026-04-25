'use client';
/**
 * app/workout/page.jsx
 *
 * Workout page — uses TensorFlow.js MoveNet (in-browser) for real-time pose
 * analysis. No Python server or WebSocket required.
 *
 * Flow:
 *   CameraFeed (TF.js MoveNet) → keypoints
 *   → PoseEngine (rep counting / form scoring)
 *   → UI + VoiceCoach
 */
import { useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box, Grid, Card, CardContent, Typography, Button, Select,
  MenuItem, FormControl, InputLabel, Divider, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Tooltip, Slider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import TimerIcon from '@mui/icons-material/Timer';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { motion } from 'framer-motion';
import CameraFeed from '@/components/CameraFeed';
import RepCounter from '@/components/RepCounter';
import FeedbackBanner from '@/components/FeedbackBanner';
import { workoutApi } from '@/lib/apiClient';
import { useVoiceCoach } from '@/hooks/useVoiceCoach';
import { PoseEngine } from '@/lib/poseEngine';
import ProtectedLayout from '@/components/ProtectedLayout';

// ── Constants ─────────────────────────────────────────────────────────────────

const EXERCISES = [
  { value: 'squat',  label: 'Squats',      icon: <DirectionsRunIcon /> },
  { value: 'pushup', label: 'Push-Ups',    icon: <FitnessCenterIcon /> },
  { value: 'lunge',  label: 'Lunges',      icon: <DirectionsRunIcon /> },
  { value: 'curl',   label: 'Bicep Curls', icon: <FitnessCenterIcon /> },
];

const TIPS = {
  squat:  'Keep chest up, drive through heels, knees track toes.',
  pushup: 'Keep core tight, elbows at 45°, chest to floor.',
  lunge:  'Step far enough, front knee over ankle, torso upright.',
  curl:   'Keep elbows fixed, full range of motion, controlled descent.',
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const timerRef = useRef(null);
  const restIntervalRef = useRef(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [exercise, setExercise] = useState(searchParams.get('exercise') || 'squat');
  const [isRunning, setIsRunning] = useState(false);
  const [poseData, setPoseData]   = useState(null);
  const [elapsed, setElapsed]     = useState(0);
  const [feedbackLog, setFeedbackLog]   = useState([]);
  const [formScores, setFormScores]     = useState([]);
  const [saving, setSaving]             = useState(false);
  const [snack, setSnack]               = useState({ open: false, message: '', severity: 'success' });
  const [summaryOpen, setSummaryOpen]   = useState(false);
  const [lastResult, setLastResult]     = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [restTimerOpen, setRestTimerOpen] = useState(false);
  const [restTarget, setRestTarget]       = useState(60);
  const [restElapsed, setRestElapsed]     = useState(0);
  const [isResting, setIsResting]         = useState(false);

  // ── PoseEngine — stateful, recreated on exercise change ───────────────────
  const engineRef = useRef(null);
  if (!engineRef.current || engineRef.current.exercise !== exercise) {
    engineRef.current = new PoseEngine(exercise);
  }

  // ── Voice coach ────────────────────────────────────────────────────────────
  const { announceExerciseStart, processPoseResult, announceWorkoutEnd, stop: stopVoice } = useVoiceCoach(voiceEnabled);

  // ── Pose callback (from CameraFeed → MoveNet keypoints) ───────────────────
  const handleKeypoints = useCallback((keypoints) => {
    if (!isRunning) return;

    const result = engineRef.current.processFrame(keypoints);
    setPoseData(result);

    if (result.feedback?.length > 0) {
      setFeedbackLog((prev) => {
        const last = prev[prev.length - 1];
        return last !== result.feedback[0]
          ? [...prev.slice(-19), result.feedback[0]]
          : prev;
      });
    }
    if (result.form_score != null) {
      setFormScores((prev) => [...prev.slice(-49), result.form_score]);
    }
    processPoseResult(result);
  }, [isRunning, processPoseResult]);

  // ── Workout controls ───────────────────────────────────────────────────────
  const startWorkout = () => {
    engineRef.current.reset();
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    setElapsed(0);
    setIsRunning(true);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    announceExerciseStart(exercise);
  };

  const stopWorkout = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    stopVoice();
  };

  const resumeWorkout = () => {
    if (isResting) stopRest();
    setIsRunning(true);
    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  };

  const startRest = () => {
    stopWorkout();
    setIsResting(true);
    setRestElapsed(0);
    setRestTimerOpen(true);
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
  };

  const resetWorkout = () => {
    stopWorkout();
    stopRest();
    engineRef.current.reset();
    setPoseData(null);
    setFeedbackLog([]);
    setFormScores([]);
    setElapsed(0);
  };

  const saveWorkout = async () => {
    setSaving(true);
    try {
      const eng = engineRef.current;
      const avgFormScore = formScores.length > 0
        ? formScores.reduce((a, b) => a + b, 0) / formScores.length
        : 0;

      announceWorkoutEnd(eng.repCount);

      const payload = {
        exercise,
        reps: eng.repCount,
        duration_seconds: elapsed,
        avg_form_score: avgFormScore,
        feedback_log: feedbackLog.slice(-10),
        perfect_reps: eng.perfectReps,
      };

      const result = await workoutApi.completeWorkout(payload);
      setLastResult(result);
      setSummaryOpen(true);
      resetWorkout();
    } catch (err) {
      setSnack({ open: true, message: 'Failed to save workout — check your connection.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const avgForm = formScores.length > 0
    ? Math.round((formScores.reduce((a, b) => a + b, 0) / formScores.length) * 100)
    : 0;

  const repCount   = poseData?.rep_count ?? 0;
  const stage      = poseData?.stage ?? 'up';
  const feedback   = poseData?.feedback ?? [];
  const angles     = poseData?.angles ?? {};

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <ProtectedLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>AI Workout Coach</Typography>
            <Typography color="text.secondary">Real-time pose analysis &amp; rep counting — 100% in-browser via TensorFlow.js</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Voice toggle */}
            <Tooltip title={voiceEnabled ? 'Voice Coach ON — click to mute' : 'Voice Coach OFF'}>
              <Box
                id="voice-coach-toggle"
                onClick={() => { if (voiceEnabled) stopVoice(); setVoiceEnabled((v) => !v); }}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 99, cursor: 'pointer', background: voiceEnabled ? 'linear-gradient(135deg, rgba(124,77,255,0.2), rgba(0,230,118,0.1))' : 'rgba(255,255,255,0.04)', border: voiceEnabled ? '1px solid rgba(124,77,255,0.45)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                {voiceEnabled
                  ? <RecordVoiceOverIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                  : <VolumeOffIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                <Typography variant="body2" fontWeight={700} sx={{ color: voiceEnabled ? 'secondary.main' : 'text.secondary' }}>
                  {voiceEnabled ? 'Coach ON' : 'Coach OFF'}
                </Typography>
              </Box>
            </Tooltip>

            {/* Timer chip */}
            <Chip
              icon={<TimerIcon fontSize="small" sx={{ color: isRunning ? '#00E676' : 'text.secondary' }} />}
              label={isRunning ? formatTime(elapsed) : 'Ready'}
              sx={{ bgcolor: isRunning ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.06)', color: isRunning ? '#00E676' : 'text.secondary', fontWeight: 700, fontSize: '1rem', px: 1, height: 40 }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* ── Left: Camera + skeleton ─────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                {/* Exercise selector (only when not running) */}
                {!isRunning && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="exercise-label">Exercise</InputLabel>
                    <Select
                      labelId="exercise-label"
                      id="exercise-select"
                      value={exercise}
                      label="Exercise"
                      onChange={(e) => { setExercise(e.target.value); resetWorkout(); }}
                    >
                      {EXERCISES.map((ex) => (
                        <MenuItem key={ex.value} value={ex.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {ex.icon} {ex.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Camera feed */}
                <CameraFeed
                  exercise={exercise}
                  active={isRunning}
                  onPoseResult={handleKeypoints}
                />

                {/* Feedback banner */}
                <Box mt={2}>
                  <FeedbackBanner feedback={isRunning ? feedback : []} />
                </Box>

                {/* Joint angle chips */}
                {isRunning && Object.keys(angles).length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                    {Object.entries(angles).map(([joint, angle]) => (
                      <Chip
                        key={joint}
                        label={`${joint}: ${angle}°`}
                        size="small"
                        sx={{ bgcolor: 'rgba(124,77,255,0.15)', color: 'secondary.main', fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── Right: Stats + controls ─────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Rep counter */}
              <Card>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <RepCounter count={repCount} stage={stage} exercise={exercise} />
                </CardContent>
              </Card>

              {/* Session stats */}
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>SESSION STATS</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={800} color="primary.main">{avgForm}%</Typography>
                      <Typography variant="caption" color="text.secondary">Avg Form</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={800} color="secondary.main">{formatTime(elapsed)}</Typography>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: '#00E676' }}>
                        {engineRef.current?.perfectReps ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Perfect</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Control buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {!isRunning && elapsed === 0 ? (
                  <Button id="start-workout-btn" variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={startWorkout} fullWidth sx={{ py: 1.5 }}>
                    Start Workout
                  </Button>
                ) : !isRunning && elapsed > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                    <Button id="resume-workout-btn" variant="contained" size="large" startIcon={<PlayArrowIcon />} onClick={resumeWorkout} sx={{ flex: 1, py: 1.5 }}>Resume</Button>
                    <Button
                      id="save-workout-btn"
                      variant="contained" color="secondary" size="large"
                      onClick={saveWorkout}
                      disabled={saving || repCount === 0}
                      sx={{ flex: 1, py: 1.5 }}
                    >
                      {saving ? <CircularProgress size={20} color="inherit" /> : 'Save & Finish'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: '100%' }}>
                    <Button id="stop-workout-btn" variant="contained" color="warning" size="large" startIcon={<StopIcon />} onClick={stopWorkout} sx={{ flex: 1, py: 1.5 }}>Pause</Button>
                    <Button variant="outlined" size="large" startIcon={<HourglassEmptyIcon />} onClick={startRest} sx={{ flex: 1, py: 1.5, borderColor: 'rgba(255,255,255,0.2)' }}>Rest</Button>
                    <Button
                      id="save-workout-btn-running"
                      variant="contained" color="secondary" size="large"
                      onClick={saveWorkout}
                      disabled={saving || repCount === 0}
                      sx={{ flex: 1, py: 1.5 }}
                    >
                      {saving ? <CircularProgress size={20} color="inherit" /> : 'Finish'}
                    </Button>
                  </Box>
                )}

                {(isRunning || elapsed > 0) && (
                  <Button
                    id="reset-workout-btn"
                    variant="outlined" size="large" fullWidth
                    onClick={resetWorkout}
                    startIcon={<RestartAltIcon />}
                    sx={{ py: 1, borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }}
                  >
                    Reset
                  </Button>
                )}
              </Box>

              {/* Tips */}
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LightbulbIcon fontSize="small" /> FORM TIPS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{TIPS[exercise]}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* ── Workout Summary Dialog ──────────────────────────────────────── */}
        <Dialog
          id="workout-summary-dialog"
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 340, background: 'rgba(18,18,26,0.99)', border: '1px solid rgba(0,230,118,0.2)' } }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            <Typography variant="h5" fontWeight={800}>Workout Complete! 🎉</Typography>
          </DialogTitle>
          <DialogContent>
            {lastResult && (
              <Box sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h2" fontWeight={900} color="primary.main">+{lastResult.xp_earned} XP</Typography>
                <Typography color="text.secondary" mb={2}>earned this session</Typography>
                {lastResult.new_achievements?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="secondary.main" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <EmojiEventsIcon fontSize="small" /> Achievement{lastResult.new_achievements.length > 1 ? 's' : ''} Unlocked!
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {lastResult.new_achievements.map((a) => (
                        <Chip key={a.id} label={a.title} icon={<EmojiEventsIcon />} sx={{ bgcolor: 'rgba(124,77,255,0.2)', color: 'secondary.light', fontWeight: 700 }} />
                      ))}
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Streak</Typography>
                    <Typography fontWeight={700} color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalFireDepartmentIcon fontSize="small" /> {lastResult.new_streak} days
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Level</Typography>
                    <Typography fontWeight={700} color="secondary.main">
                      {lastResult.gamification?.level_name ?? 'Beginner'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
            <Button onClick={() => setSummaryOpen(false)} variant="outlined" fullWidth sx={{ borderColor: 'rgba(255,255,255,0.15)' }}>Stay Here</Button>
            <Button onClick={() => { setSummaryOpen(false); router.push('/dashboard'); }} variant="contained" fullWidth>Dashboard</Button>
          </DialogActions>
        </Dialog>

        {/* ── Rest Timer Dialog ───────────────────────────────────────────── */}
        <Dialog
          open={restTimerOpen}
          onClose={() => stopRest(false)}
          PaperProps={{ sx: { background: 'rgba(18,18,26,0.98)', borderRadius: 4, minWidth: 280, textAlign: 'center', p: 2 } }}
        >
          <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <HourglassEmptyIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Typography variant="h5" fontWeight={800}>Rest Time</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <CircularProgress variant="determinate" value={100} size={120} sx={{ color: 'rgba(255,255,255,0.05)', position: 'absolute' }} thickness={4} />
              <CircularProgress variant="determinate" value={Math.min((restElapsed / restTarget) * 100, 100)} size={120} color="secondary" thickness={4} />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h4" fontWeight={900}>{Math.max(0, restTarget - restElapsed)}s</Typography>
              </Box>
            </Box>
            <Typography color="text.secondary" gutterBottom>Adjust duration (seconds)</Typography>
            <Slider
              value={restTarget}
              onChange={(_, v) => setRestTarget(v)}
              step={15} marks
              min={15} max={180}
              color="secondary"
              sx={{ px: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={() => stopRest(false)} variant="contained" size="large" fullWidth>Skip Rest</Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ──────────────────────────────────────────────────── */}
        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </ProtectedLayout>
  );
}
