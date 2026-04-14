// components/CameraFeed.jsx
// Captures webcam frames at 10fps, sends via WebSocket, 
// displays annotated frame (with skeleton) returned by server.
import { useEffect, useRef, useCallback, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { useWorkoutWebSocket } from "../hooks/useWebSocket";

const FRAME_INTERVAL_MS = 100; // 10 fps

export default function CameraFeed({ exercise, onPoseResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [annotatedSrc, setAnnotatedSrc] = useState(null);

  // WebSocket hook
  const { connected, error: wsError, sendFrame } = useWorkoutWebSocket(exercise, (data) => {
    if (data.detected && data.frame) {
      setAnnotatedSrc(`data:image/jpeg;base64,${data.frame}`);
    }
    if (onPoseResult) onPoseResult(data);
  });

  // Start camera
  useEffect(() => {
    let stream = null;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      })
      .catch(() => {
        setCameraError("Camera permission denied or unavailable.");
      });

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setCameraReady(false);
    };
  }, []);

  // Capture & send frames
  const captureAndSend = useCallback(() => {
    if (!cameraReady || !connected) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress to JPEG and strip data URL prefix
    const b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
    sendFrame(b64);
  }, [cameraReady, connected, sendFrame]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(captureAndSend, FRAME_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [captureAndSend]);

  if (cameraError) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "4/3",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          background: "rgba(18,18,26,0.9)",
          border: "1px solid rgba(255,82,82,0.3)",
        }}
      >
        <VideocamOffIcon sx={{ fontSize: 56, color: "error.main" }} />
        <Typography color="error.main" fontWeight={600}>{cameraError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", borderRadius: 3, overflow: "hidden" }}>
      {/* Hidden video element for camera stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      {/* Hidden capture canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Display: annotated frame from server OR raw camera (while connecting) */}
      {annotatedSrc ? (
        <img
          src={annotatedSrc}
          alt="Pose analysis"
          style={{
            width: "100%",
            borderRadius: 12,
            display: "block",
            transform: "scaleX(-1)", // mirror for selfie view
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            aspectRatio: "4/3",
            borderRadius: 3,
            background: "#0a0a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: "primary.main" }} />
          <Typography color="text.secondary" variant="body2">
            {!cameraReady ? "Starting camera…" : !connected ? "Connecting to AI…" : "Detecting pose…"}
          </Typography>
        </Box>
      )}

      {/* Connection status badge */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          px: 1.5,
          py: 0.5,
          borderRadius: 99,
          bgcolor: connected ? "rgba(0,230,118,0.15)" : "rgba(255,82,82,0.15)",
          border: `1px solid ${connected ? "rgba(0,230,118,0.4)" : "rgba(255,82,82,0.4)"}`,
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 0.7,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: connected ? "primary.main" : "error.main",
            ...(connected
              ? { animation: "pulse 1.5s infinite", "@keyframes pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }
              : {}),
          }}
        />
        <Typography variant="caption" fontWeight={700} color={connected ? "primary.main" : "error.main"}>
          {connected ? "AI Live" : wsError ? "Error" : "Connecting…"}
        </Typography>
      </Box>
    </Box>
  );
}
