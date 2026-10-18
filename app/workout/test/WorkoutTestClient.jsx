'use client';
/**
 * app/workout/test/WorkoutTestClient.jsx
 *
 * Dedicated AI Workout Testing Bench.
 * Tests MoveNet AI pose detection and PoseEngine rep counting & feedback
 * using pre-recorded videos from /public/videos/ or custom uploaded videos.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Grid, Card, CardContent, Typography, Button, Select,
  MenuItem, FormControl, InputLabel, Divider, Chip, Tooltip,
  ToggleButtonGroup, ToggleButton, Switch, FormControlLabel,
  Paper, IconButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ScienceIcon from '@mui/icons-material/Science';
import SpeedIcon from '@mui/icons-material/Speed';
import RepeatIcon from '@mui/icons-material/Repeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import VideoTesterFeed from '@/components/VideoTesterFeed';
import RepCounter from '@/components/RepCounter';
import FeedbackBanner from '@/components/FeedbackBanner';
import { PoseEngine } from '@/lib/poseEngine';
import ProtectedLayout from '@/components/ProtectedLayout';

// Public test videos list
const PRESET_VIDEOS = [
  {
    id: 'squat',
    label: 'Squat Demo',
    src: '/videos/squat.mp4',
    defaultExercise: 'squat',
    fileSize: '~1.3 MB',
    description: 'Deep squat reps with side profile',
  },
  {
    id: 'pushup',
    label: 'Push-Up Demo',
    src: '/videos/pushup.mp4',
    defaultExercise: 'pushup',
    fileSize: '~540 KB',
    description: 'Push-up reps checking chest depth & torso angle',
  },
  {
    id: 'curl',
    label: 'Bicep Curl Demo',
    src: '/videos/curl.mp4',
    defaultExercise: 'curl',
    fileSize: '~704 KB',
    description: 'Standing dumbbell curl reps checking elbow angle',
  },
  {
    id: 'lunge',
    label: 'Lunge Demo',
    src: '/videos/lunge.mp4',
    defaultExercise: 'lunge',
    fileSize: '~336 KB',
    description: 'Alternating lunges checking knee flexion',
  },
];

const EXERCISES = [
  { value: 'squat', label: 'Squats', icon: <DirectionsRunIcon /> },
  { value: 'pushup', label: 'Push-Ups', icon: <FitnessCenterIcon /> },
  { value: 'lunge', label: 'Lunges', icon: <DirectionsRunIcon /> },
  { value: 'curl', label: 'Bicep Curls', icon: <FitnessCenterIcon /> },
];

export default function WorkoutTestClient() {
  const [selectedVideo, setSelectedVideo] = useState(PRESET_VIDEOS[0]);
  const [exercise, setExercise] = useState('squat');
  const [isRunning, setIsRunning] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopVideo, setLoopVideo] = useState(true);
  const [customVideoSrc, setCustomVideoSrc] = useState(null);
  const [customVideoName, setCustomVideoName] = useState('');

  const [poseData, setPoseData] = useState(null);
  const [formScores, setFormScores] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [fpsCount, setFpsCount] = useState(0);

  const fileInputRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const framesCountRef = useRef(0);

  // Pose engine instance
  const engineRef = useRef(null);
  if (!engineRef.current || engineRef.current.exercise !== exercise) {
    engineRef.current = new PoseEngine(exercise);
  }

  // Handle incoming MoveNet keypoints
  const handleKeypoints = useCallback((keypoints) => {
    // Calculate FPS
    framesCountRef.current += 1;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      setFpsCount(framesCountRef.current);
      framesCountRef.current = 0;
      lastTimeRef.current = now;
    }

    if (!isRunning) return;

    const result = engineRef.current.processFrame(keypoints);
    setPoseData(result);

    if (result.feedback?.length > 0) {
      setFeedbackHistory((prev) => {
        const last = prev[prev.length - 1];
        return last !== result.feedback[0]
          ? [...prev.slice(-14), result.feedback[0]]
          : prev;
      });
    }

    if (result.form_score != null) {
      setFormScores((prev) => [...prev.slice(-49), result.form_score]);
    }
  }, [isRunning]);

  const resetAnalysis = () => {
    engineRef.current.reset();
    setPoseData(null);
    setFormScores([]);
    setFeedbackHistory([]);
  };

  const handleSelectPreset = (video) => {
    setSelectedVideo(video);
    setCustomVideoSrc(null);
    setCustomVideoName('');
    setExercise(video.defaultExercise);
    resetAnalysis();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoSrc(url);
      setCustomVideoName(file.name);
      resetAnalysis();
    }
  };

  const activeVideoSrc = customVideoSrc || selectedVideo.src;

  const repCount = poseData?.rep_count ?? 0;
  const stage = poseData?.stage ?? 'up';
  const feedback = poseData?.feedback ?? [];
  const angles = poseData?.angles ?? {};

  const avgForm = formScores.length > 0
    ? Math.round((formScores.reduce((a, b) => a + b, 0) / formScores.length) * 100)
    : 100;

  return (
    <ProtectedLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Link href="/workout" style={{ textDecoration: 'none' }}>
                <Button
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.05)', px: 1.5 }}
                >
                  Live Camera
                </Button>
              </Link>
              <Chip
                icon={<ScienceIcon sx={{ fontSize: '1rem !important' }} />}
                label="AI Testing Lab"
                color="secondary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Typography variant="h4" fontWeight={900}>
              Video Benchmark &amp; Testing
            </Typography>
            <Typography color="text.secondary">
              Test and calibrate MoveNet pose estimation and rep counters using pre-recorded videos in <code style={{ color: '#FF7043' }}>public/videos/</code>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<SpeedIcon fontSize="small" sx={{ color: '#00E676' }} />}
              label={`${fpsCount} FPS`}
              sx={{ bgcolor: 'rgba(0,230,118,0.12)', color: '#00E676', fontWeight: 700 }}
            />
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RestartAltIcon />}
              onClick={resetAnalysis}
            >
              Reset Counters
            </Button>
          </Box>
        </Box>

        {/* Video selector bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            background: 'rgba(18, 18, 28, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VideoLibraryIcon fontSize="small" /> Select Test Video:
              </Typography>

              {PRESET_VIDEOS.map((preset) => {
                const isSelected = !customVideoSrc && selectedVideo.id === preset.id;
                return (
                  <Button
                    key={preset.id}
                    variant={isSelected ? 'contained' : 'outlined'}
                    color={isSelected ? 'primary' : 'inherit'}
                    size="small"
                    onClick={() => handleSelectPreset(preset)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.15)',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                    }}
                  >
                    {preset.label}
                  </Button>
                );
              })}

              {/* Upload custom video */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant={customVideoSrc ? 'contained' : 'outlined'}
                color="secondary"
                size="small"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                {customVideoName ? `Custom: ${customVideoName.slice(0, 15)}…` : 'Upload Video'}
              </Button>
            </Box>

            {/* Exercise model selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Model:</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={exercise}
                  onChange={(e) => {
                    setExercise(e.target.value);
                    resetAnalysis();
                  }}
                  sx={{ borderRadius: 2 }}
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
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column: Video Tester + Controls */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Video player with skeleton */}
                <VideoTesterFeed
                  videoSrc={activeVideoSrc}
                  active={isRunning}
                  onPoseResult={handleKeypoints}
                  loop={loopVideo}
                  playbackRate={playbackRate}
                  onPlaybackStateChange={(playing) => setIsRunning(playing)}
                />

                {/* Video playback speed & controls bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="contained"
                      color={isRunning ? 'warning' : 'primary'}
                      startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                      onClick={() => setIsRunning(!isRunning)}
                      sx={{ px: 3, fontWeight: 700 }}
                    >
                      {isRunning ? 'Pause Analysis' : 'Start AI Analysis'}
                    </Button>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={loopVideo}
                          onChange={(e) => setLoopVideo(e.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RepeatIcon fontSize="small" /> Loop Video
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Playback speed selector */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      SPEED:
                    </Typography>
                    <ToggleButtonGroup
                      value={playbackRate}
                      exclusive
                      size="small"
                      onChange={(_, val) => { if (val) setPlaybackRate(val); }}
                      sx={{
                        '& .MuiToggleButton-root': {
                          px: 1.2,
                          py: 0.4,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderColor: 'rgba(255,255,255,0.1)',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(255,87,34,0.2)',
                            color: 'primary.main',
                          },
                        },
                      }}
                    >
                      <ToggleButton value={0.5}>0.5x</ToggleButton>
                      <ToggleButton value={0.75}>0.75x</ToggleButton>
                      <ToggleButton value={1}>1.0x</ToggleButton>
                      <ToggleButton value={1.25}>1.25x</ToggleButton>
                      <ToggleButton value={1.5}>1.5x</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* Real-time Feedback Banner */}
                <Box mt={2}>
                  <FeedbackBanner feedback={isRunning ? feedback : []} />
                </Box>

                {/* Detected Angles */}
                {Object.keys(angles).length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 1, fontWeight: 700 }}>
                      REAL-TIME ANGLES:
                    </Typography>
                    {Object.entries(angles).map(([joint, angle]) => (
                      <Chip
                        key={joint}
                        label={`${joint}: ${angle}°`}
                        size="small"
                        sx={{ bgcolor: 'rgba(124,77,255,0.18)', color: 'secondary.light', fontWeight: 700, fontSize: '0.8rem' }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Testing Analytics & Rep Counter */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Rep counter card */}
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <RepCounter count={repCount} stage={stage} exercise={exercise} />
                </CardContent>
              </Card>

              {/* Benchmarking stats */}
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" mb={1.5} fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AnalyticsIcon fontSize="small" /> ACCURACY &amp; BENCHMARKS
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                      <Typography variant="h5" fontWeight={900} color="primary.main">
                        {avgForm}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Avg Form Score</Typography>
                    </Box>

                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                      <Typography variant="h5" fontWeight={900} sx={{ color: '#00E676' }}>
                        {engineRef.current?.perfectReps ?? 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Clean Reps</Typography>
                    </Box>

                    <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                      <Typography variant="h5" fontWeight={900} color="secondary.main">
                        {fpsCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Infer FPS</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                  {/* Video Metadata */}
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Active Source: <b>{customVideoName || selectedVideo.label}</b>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    File Path: <code style={{ color: '#00E676' }}>{customVideoSrc ? 'Blob URL' : selectedVideo.src}</code>
                  </Typography>
                  {!customVideoSrc && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Details: {selectedVideo.description} ({selectedVideo.fileSize})
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Real-time Feedback Log */}
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1.5}>
                    FEEDBACK HISTORY ({feedbackHistory.length})
                  </Typography>

                  {feedbackHistory.length === 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Start playback to record form feedback triggers...
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 200, overflowY: 'auto' }}>
                      {feedbackHistory.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderLeft: '3px solid #FF5722',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ProtectedLayout>
  );
}
