import { Suspense } from 'react';
import WorkoutClient from './WorkoutClient';
import { Box, CircularProgress } from '@mui/material';

export default function WorkoutPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f' }}>
        <CircularProgress color="primary" />
      </Box>
    }>
      <WorkoutClient />
    </Suspense>
  );
}
