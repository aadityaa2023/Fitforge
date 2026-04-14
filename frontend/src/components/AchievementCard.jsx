import { Box, Typography, Chip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion } from "framer-motion";

export default function AchievementCard({ achievement, index = 0 }) {
  const { title, description, icon, xp_reward, unlocked } = achievement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={unlocked ? { y: -4, scale: 1.02 } : {}}
    >
      <Box
        id={`achievement-${achievement.id}`}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: unlocked
            ? "linear-gradient(135deg, rgba(0,230,118,0.1), rgba(124,77,255,0.08))"
            : "rgba(18,18,26,0.8)",
          border: unlocked
            ? "1px solid rgba(0,230,118,0.3)"
            : "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
          filter: unlocked ? "none" : "grayscale(60%)",
          opacity: unlocked ? 1 : 0.6,
          cursor: "default",
          height: "100%",
        }}
      >
        {/* Glow for unlocked */}
        {unlocked && (
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              lineHeight: 1,
              flexShrink: 0,
              filter: unlocked ? "none" : "grayscale(1) opacity(0.4)",
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: "2rem", color: unlocked ? 'primary.main' : 'inherit' }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
              {unlocked ? (
                <Chip
                  label="Unlocked"
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,230,118,0.15)",
                    color: "primary.main",
                    fontSize: "0.65rem",
                    height: 20,
                    fontWeight: 700,
                  }}
                />
              ) : (
                <LockIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {description}
            </Typography>
            <Chip
              label={`+${xp_reward} XP`}
              size="small"
              sx={{
                bgcolor: "rgba(124,77,255,0.15)",
                color: "secondary.main",
                fontWeight: 700,
                fontSize: "0.72rem",
              }}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
