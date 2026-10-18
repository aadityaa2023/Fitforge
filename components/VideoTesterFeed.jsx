'use client';
/**
 * components/VideoTesterFeed.jsx
 *
 * Runs browser-side MoveNet pose detection on pre-recorded workout videos
 * (e.g. /videos/squat.mp4, /videos/pushup.mp4, /videos/curl.mp4, /videos/lunge.mp4)
 * or user-uploaded video files.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, IconButton, Slider, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { usePoseDetection } from '@/hooks/usePoseDetection';
import { SKELETON_CONNECTIONS } from '@/lib/poseEngine';

// Drawing colors & threshold
const JOINT_COLOR_HIGH = '#00E676';
const JOINT_COLOR_LOW  = '#FFB300';
const BONE_COLOR       = 'rgba(0, 230, 118, 0.75)';
const CONF_THRESHOLD   = 0.25;

function drawSkeleton(ctx, keypoints, width, height) {
  if (!ctx || !keypoints?.length) return;

  ctx.clearRect(0, 0, width, height);

  // Draw bones
  ctx.lineWidth = 3;
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

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}44`;
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

export default function VideoTesterFeed({
  videoSrc,
  active,
  onPoseResult,
  loop = true,
  playbackRate = 1,
  onPlaybackStateChange,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Sync canvas dimensions to natural video dimensions
  const syncCanvas = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    if (v.videoWidth && v.videoHeight) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
    }
  }, []);

  // Reset & load video when videoSrc changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setVideoLoaded(false);
    setCurrentTime(0);

    video.src = videoSrc;
    video.playbackRate = playbackRate;
    video.loop = loop;
    video.muted = isMuted;
    video.load();

    const handleLoadedMetadata = () => {
      syncCanvas();
      setDuration(video.duration || 0);
      setVideoLoaded(true);
      if (active) {
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoSrc, syncCanvas]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sync loop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = loop;
    }
  }, [loop]);

  // Sync active state (play / pause)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoLoaded) return;

    if (active) {
      video.play().then(() => {
        setIsPlaying(true);
        onPlaybackStateChange?.(true);
      }).catch((err) => console.log('Autoplay prevented:', err));
    } else {
      video.pause();
      setIsPlaying(false);
      onPlaybackStateChange?.(false);
    }
  }, [active, videoLoaded, onPlaybackStateChange]);

  // Pose callback — feed into PoseEngine & draw on canvas
  const handlePose = useCallback((keypoints) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const w = canvas.width || video.videoWidth || 640;
    const h = canvas.height || video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    drawSkeleton(ctx, keypoints, w, h);

    if (onPoseResult) {
      onPoseResult(keypoints);
    }
  }, [onPoseResult]);

  // Run MoveNet pose detection without horizontal flip (video is regular perspective, not selfie)
  const { modelState } = usePoseDetection(videoRef, active && videoLoaded, handlePose, 'Lightning', false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      onPlaybackStateChange?.(true);
    } else {
      video.pause();
      setIsPlaying(false);
      onPlaybackStateChange?.(false);
    }
  };

  const restartVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play();
    setIsPlaying(true);
    onPlaybackStateChange?.(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (_, newTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const statusLabel = !videoLoaded
    ? 'Loading video…'
    : modelState === 'loading'
    ? 'Loading AI Model…'
    : modelState === 'error'
    ? 'AI Model Error'
    : modelState === 'ready' && active
    ? 'Analyzing Video'
    : 'Video Ready';

  const statusColor = modelState === 'ready' && active
    ? '#00E676'
    : modelState === 'error'
    ? '#ef4444'
    : '#FFB300';

  return (
    <Box sx={{ position: 'relative', width: '100%', borderRadius: 3, overflow: 'hidden', bgcolor: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Container for video + skeleton overlay */}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            if (!loop) {
              setIsPlaying(false);
              onPlaybackStateChange?.(false);
            }
          }}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            objectFit: 'contain',
          }}
        />

        {/* Skeleton canvas overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            objectFit: 'contain',
          }}
        />

        {/* Loading overlay */}
        {(!videoLoaded || modelState === 'loading') && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 3,
            }}
          >
            <CircularProgress size={44} sx={{ color: '#FF5722' }} />
            <Typography variant="body2" color="text.secondary">
              {statusLabel}
            </Typography>
          </Box>
        )}

        {/* Status badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: 99,
            bgcolor: `${statusColor}22`,
            border: `1px solid ${statusColor}66`,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            zIndex: 4,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: statusColor,
              animation: modelState === 'ready' && active && isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            }}
          />
          <Typography variant="caption" fontWeight={700} sx={{ color: statusColor }}>
            {statusLabel}
          </Typography>
        </Box>
      </Box>

      {/* Video controls bar */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'rgba(14, 14, 22, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Progress slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 35, fontFamily: 'monospace' }}>
            {formatSeconds(currentTime)}
          </Typography>
          <Slider
            size="small"
            value={currentTime}
            max={duration || 1}
            step={0.05}
            onChange={handleSeek}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 6px rgba(255, 87, 34, 0.16)',
                },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 35, fontFamily: 'monospace' }}>
            {formatSeconds(duration)}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={isPlaying ? 'Pause Video' : 'Play Video'}>
              <IconButton onClick={togglePlay} color="primary" sx={{ bgcolor: 'rgba(255,87,34,0.1)' }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Restart Video">
              <IconButton onClick={restartVideo} sx={{ color: 'text.secondary' }}>
                <ReplayIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
              <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ color: 'text.secondary' }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Resolution: {videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
