'use client';
import { Box, Typography, LinearProgress } from '@mui/material';

export default function XPBar({ xp, level, levelName, xpToNext, currentLevelMinXp }) {
  const progress = xpToNext
    ? Math.min(((xp - currentLevelMinXp) / (xpToNext - currentLevelMinXp)) * 100, 100)
    : 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          Level {level} — {levelName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {xp.toLocaleString()} XP{xpToNext ? ` / ${xpToNext.toLocaleString()}` : ' (Max)'}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
}
