'use client';
import { Box, Typography } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export default function StreakBadge({ streak, size = 'medium' }) {
  const isLarge = size === 'large';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: isLarge ? 2 : 1.5,
        py: isLarge ? 1 : 0.75,
        borderRadius: 2,
        bgcolor: streak > 0 ? 'rgba(255, 87, 34, 0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${streak > 0 ? 'rgba(255, 87, 34, 0.3)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <LocalFireDepartmentIcon sx={{ fontSize: isLarge ? 22 : 18, color: streak > 0 ? 'warning.main' : 'text.secondary' }} />
      <Box>
        <Typography variant={isLarge ? 'h6' : 'body2'} fontWeight={800} color={streak > 0 ? 'warning.main' : 'text.secondary'}>
          {streak}
        </Typography>
        {isLarge && <Typography variant="caption" color="text.secondary">day streak</Typography>}
      </Box>
    </Box>
  );
}
