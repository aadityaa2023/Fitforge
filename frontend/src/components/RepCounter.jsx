// components/RepCounter.jsx — Animated circular rep counter
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";

export default function RepCounter({ count = 0, stage = "up", exercise = "squat" }) {
  const exerciseIcons = {
    squat: <DirectionsRunIcon fontSize="large" />,
    pushup: <FitnessCenterIcon fontSize="large" />,
    lunge: <DirectionsRunIcon fontSize="large" />,
    curl: <FitnessCenterIcon fontSize="large" />,
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(0,230,118,0.15), rgba(0,0,0,0.4))",
          border: "3px solid rgba(0,230,118,0.4)",
          boxShadow: "0 0 30px rgba(0,230,118,0.2), inset 0 0 30px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            border: "2px solid rgba(0,230,118,0.3)",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: 900, color: "primary.main", lineHeight: 1 }}
            >
              {count}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
        Reps
      </Typography>

      {/* Stage indicator */}
      <Box
        sx={{
          mt: 0.5,
          px: 2,
          py: 0.5,
          borderRadius: 99,
          bgcolor: stage === "down" ? "rgba(0,230,118,0.15)" : "rgba(124,77,255,0.15)",
          border: `1px solid ${stage === "down" ? "rgba(0,230,118,0.4)" : "rgba(124,77,255,0.4)"}`,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: stage === "down" ? "primary.main" : "secondary.main",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {stage === "down" ? "↓ Hold" : "↑ Up"}
        </Typography>
      </Box>

      <Box mt={0.5}>{exerciseIcons[exercise] || <FitnessCenterIcon fontSize="large" />}</Box>
    </Box>
  );
}
