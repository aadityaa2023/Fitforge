// components/StreakBadge.jsx — Animated streak fire badge
import { Box, Typography, Tooltip } from "@mui/material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { motion } from "framer-motion";

export default function StreakBadge({ streak = 0, size = "medium" }) {
  const isHot = streak >= 7;
  const isOnFire = streak >= 30;
  const iconSize = size === "large" ? 36 : size === "small" ? 18 : 24;
  const fontSize = size === "large" ? "1.8rem" : size === "small" ? "0.9rem" : "1.2rem";

  const color = isOnFire ? "#ff6f00" : isHot ? "#ff9800" : "#ffb74d";

  return (
    <Tooltip title={`${streak}-day workout streak!`}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          bgcolor: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: 99,
          px: size === "large" ? 2 : 1.5,
          py: size === "large" ? 1 : 0.5,
          cursor: "default",
        }}
      >
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <LocalFireDepartmentIcon sx={{ fontSize: iconSize, color }} />
        </motion.div>
        <Typography sx={{ fontWeight: 800, fontSize, color }}>
          {streak}
        </Typography>
        {size !== "small" && (
          <Typography variant="caption" sx={{ color: `${color}cc`, fontWeight: 600 }}>
            {streak === 1 ? "day" : "days"}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
