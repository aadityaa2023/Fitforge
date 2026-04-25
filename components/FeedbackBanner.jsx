'use client';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { AnimatePresence, motion } from 'framer-motion';

export default function FeedbackBanner({ feedback }) {
  if (!feedback || feedback.length === 0) return null;
  const msg = feedback[0];
  const isGood = msg.toLowerCase().includes('good') || msg.toLowerCase().includes('perfect') || msg.toLowerCase().includes('great');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={msg}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: isGood ? 'rgba(16,185,129,0.1)' : 'rgba(255,87,34,0.1)',
            border: `1px solid ${isGood ? 'rgba(16,185,129,0.3)' : 'rgba(255,87,34,0.3)'}`,
          }}
        >
          {isGood
            ? <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            : <WarningAmberIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          }
          <Typography variant="body2" fontWeight={600} color={isGood ? 'success.main' : 'primary.main'}>
            {msg}
          </Typography>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
