import { Suspense } from 'react';
import WorkoutTestClient from './WorkoutTestClient';
import { Box, CircularProgress } from '@mui/material';

export const metadata = {
  title: 'AI Workout Video Testing Lab | FitForge',
  description: 'Test MoveNet AI pose detection and rep counting using pre-recorded videos in public/videos/',
};

export default function WorkoutTestPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f' }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <WorkoutTestClient />
    </Suspense>
  );
}
