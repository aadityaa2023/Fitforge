'use client';
import { Box, Typography } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

const EXERCISE_LABELS = {
  squat: 'Squats', pushup: 'Push-Ups', lunge: 'Lunges', curl: 'Bicep Curls',
};

export default function RepCounter({ count, stage, exercise }) {
  const isUp = stage === 'up';
  return (
    <Box sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ mb: 1, color: 'text.secondary', display: 'flex', justifyContent: 'center' }}>
        {exercise === 'squat' || exercise === 'lunge'
          ? <DirectionsRunIcon sx={{ fontSize: 32 }} />
          : <FitnessCenterIcon sx={{ fontSize: 32 }} />
        }
      </Box>
      <Typography variant="h1" fontWeight={900} sx={{ fontSize: '5rem', color: 'primary.main', lineHeight: 1 }}>
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>reps</Typography>
      <Box
        sx={{
          mt: 2, px: 2, py: 0.75, borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 0.5,
          bgcolor: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(255,87,34,0.12)',
          border: `1px solid ${isUp ? 'rgba(16,185,129,0.3)' : 'rgba(255,87,34,0.3)'}`,
        }}
      >
        <Typography variant="body2" fontWeight={700} color={isUp ? 'success.main' : 'primary.main'}>
          {EXERCISE_LABELS[exercise] || exercise} — {stage}
        </Typography>
      </Box>
    </Box>
  );
}
