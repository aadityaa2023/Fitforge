'use client';
/**
 * components/CameraFeed.jsx
 *
 * Renders a webcam stream with a TensorFlow.js MoveNet skeleton overlay.
 * All AI runs 100% in the browser — no WebSocket, no Python server.
 *
 * Drawing:
 *  - Mirror-flips the video (selfie UX)
 *  - Draws skeleton joints and bones on a <canvas> overlay
 *  - Color-codes: green = confident, yellow = low confidence
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { SKELETON_CONNECTIONS, KP } from '@/lib/poseEngine';

// ── Drawing constants ─────────────────────────────────────────────────────────
const JOINT_COLOR_HIGH   = '#00E676';  // green — high confidence
const JOINT_COLOR_LOW    = '#FFB300';  // amber — low confidence
const BONE_COLOR         = 'rgba(0, 230, 118, 0.55)';
const CONF_THRESHOLD     = 0.25;

function drawSkeleton(ctx, keypoints, width, height) {
  if (!ctx || !keypoints?.length) return;

  ctx.clearRect(0, 0, width, height);

  // Draw bones
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = BONE_COLOR;
  for (const [a, b] of SKELETON_CONNECTIONS) {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    if (!kpA || !kpB) continue;
    if (kpA.score < CONF_THRESHOLD || kpB.score < CONF_THRESHOLD) continue;
    ctx.beginPath();
    ctx.moveTo(kpA.x * width, kpA.y * height);
    ctx.lineTo(kpB.x * width, kpB.y * height);
    ctx.stroke();
  }

  // Draw joints
  for (const kp of keypoints) {
    if (!kp || kp.score < CONF_THRESHOLD) continue;
    const x = kp.x * width;
    const y = kp.y * height;
    const color = kp.score >= 0.5 ? JOINT_COLOR_HIGH : JOINT_COLOR_LOW;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}44`;
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CameraFeed({ exercise, active, onPoseResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // ── Camera setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    let stream = null;
    setCameraError(null);

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
      .then((s) => {
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          video.onloadedmetadata = () => {
            video.play();
            setCameraReady(true);
          };
        }
      })
      .catch(() => setCameraError('Camera permission denied or unavailable.'));

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraReady(false);
    };
  }, []);

  // ── Sync canvas size to video size ─────────────────────────────────────────
  useEffect(() => {
    if (!cameraReady || !canvasRef.current || !videoRef.current) return;
    const sync = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return;
      c.width  = v.videoWidth  || 640;
      c.height = v.videoHeight || 480;
    };
    sync();
    const video = videoRef.current;
    video?.addEventListener('resize', sync);
    return () => video?.removeEventListener('resize', sync);
  }, [cameraReady]);

  // ── Pose callback — draw + forward result ──────────────────────────────────
  const handlePose = useCallback((keypoints) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const w = canvas.width  || video.videoWidth  || 640;
    const h = canvas.height || video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    drawSkeleton(ctx, keypoints, w, h);

    if (onPoseResult) onPoseResult(keypoints);
  }, [onPoseResult]);

  const { modelState } = usePoseDetection(videoRef, active && cameraReady, handlePose);

  // ── Status label ────────────────────────────────────────────────────────────
  const statusLabel = !cameraReady
    ? 'Starting camera…'
    : modelState === 'loading'
    ? 'Loading AI model…'
    : modelState === 'error'
    ? 'AI model failed'
    : modelState === 'ready' && active
    ? 'AI Live'
    : 'Camera ready';

  const statusColor = modelState === 'ready' && active
    ? '#00E676'
    : modelState === 'error'
    ? '#ef4444'
    : '#FFB300';

  // ── Render ──────────────────────────────────────────────────────────────────
  if (cameraError) {
    return (
      <Box sx={{ width: '100%', aspectRatio: '4/3', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'rgba(18,18,26,0.9)', border: '1px solid rgba(255,82,82,0.3)' }}>
        <VideocamOffIcon sx={{ fontSize: 56, color: 'error.main' }} />
        <Typography color="error.main" fontWeight={600}>{cameraError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: '#000', lineHeight: 0 }}>
      {/* Mirrored video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          display: 'block',
          transform: 'scaleX(-1)',
          borderRadius: 12,
        }}
      />

      {/* Skeleton canvas overlay — must mirror the video too */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
          borderRadius: 12,
        }}
      />

      {/* Loading spinner overlay when model not ready */}
      {(!cameraReady || modelState === 'loading') && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: 'rgba(0,0,0,0.65)', borderRadius: 3 }}>
          <CircularProgress size={44} sx={{ color: '#FF5722' }} />
          <Typography variant="body2" color="text.secondary">{statusLabel}</Typography>
        </Box>
      )}

      {/* Status badge */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: `${statusColor}22`, border: `1px solid ${statusColor}66`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 0.7 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor, animation: modelState === 'ready' && active ? 'pulse 1.5s ease-in-out infinite' : 'none', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
        <Typography variant="caption" fontWeight={700} sx={{ color: statusColor }}>{statusLabel}</Typography>
      </Box>

      {/* Model loading progress bar */}
      {modelState === 'loading' && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #FF5722, #A855F7)', animation: 'shimmer 1.5s ease-in-out infinite', '@keyframes shimmer': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } } }} />
        </Box>
      )}
    </Box>
  );
}
