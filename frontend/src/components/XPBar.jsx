// components/XPBar.jsx — Animated experience points progress bar
import { Box, Typography, LinearProgress, Chip } from "@mui/material";
import { motion } from "framer-motion";

const LEVEL_COLORS = {
  Beginner: "#9e9e9e",
  Novice: "#4caf50",
  Intermediate: "#2196f3",
  Advanced: "#9c27b0",
  Elite: "#ff9800",
};

export default function XPBar({ xp = 0, level = 0, levelName = "Beginner", xpToNext, currentLevelMinXp = 0 }) {
  const xpInCurrentLevel = xp - currentLevelMinXp;
  const xpNeeded = xpToNext ? xpToNext - currentLevelMinXp : xpInCurrentLevel || 1;
  const progress = xpToNext ? Math.min((xpInCurrentLevel / xpNeeded) * 100, 100) : 100;
  const levelColor = LEVEL_COLORS[levelName] || "#00E676";

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={levelName}
            size="small"
            sx={{
              bgcolor: `${levelColor}22`,
              color: levelColor,
              border: `1px solid ${levelColor}44`,
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Level {level}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
            {xp.toLocaleString()}
          </Box>{" "}
          {xpToNext ? `/ ${xpToNext.toLocaleString()} XP` : "XP (Max Level!)"}
        </Typography>
      </Box>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 99,
            bgcolor: "rgba(255,255,255,0.06)",
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${levelColor}, #00E676)`,
            },
          }}
        />
      </motion.div>
    </Box>
  );
}
