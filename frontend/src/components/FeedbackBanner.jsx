// components/FeedbackBanner.jsx — Slide-in posture feedback alert
import { AnimatePresence, motion } from "framer-motion";
import { Box, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function FeedbackBanner({ feedback = [] }) {
  const hasIssue = feedback.length > 0;

  return (
    <AnimatePresence mode="wait">
      {hasIssue ? (
        <motion.div
          key={feedback[0]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255,171,64,0.18), rgba(255,82,82,0.12))",
              border: "1px solid rgba(255,171,64,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            <WarningAmberIcon sx={{ color: "warning.main", flexShrink: 0 }} />
            <Typography variant="body2" fontWeight={600} color="warning.main">
              {feedback[0]}
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <motion.div
          key="good"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,178,72,0.08))",
              border: "1px solid rgba(0,230,118,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            <CheckCircleIcon sx={{ color: "primary.main", flexShrink: 0 }} />
            <Typography variant="body2" fontWeight={600} color="primary.main">
              Great form! Keep it up!
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
