'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Alert, CircularProgress, Paper,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google failed to provide authentication credentials. Please try again.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      router.push('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(
        err.response?.data?.detail ||
        'Authentication failed. Please verify your Google account and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050505' }}>
      {/* Left branding hero panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1.2,
          position: 'relative',
          background: 'linear-gradient(200deg, #111116 0%, #050505 100%)',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 8,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            opacity: 0.7,
            backgroundImage:
              'radial-gradient(circle at 10% 10%, rgba(255, 87, 34, 0.18) 0%, transparent 55%), radial-gradient(circle at 90% 90%, rgba(255, 87, 34, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Top brand header */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(255, 87, 34, 0.45)',
              }}
            >
              <FitnessCenterIcon fontSize="medium" />
            </Box>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.03em" color="text.primary">
              FitForge
            </Typography>
          </Box>
        </Box>

        {/* Hero copy */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 540 }}>
          <Typography variant="h2" fontWeight={800} mb={3} sx={{ lineHeight: 1.15 }} letterSpacing="-0.03em">
            Forged in Fire.<br />Built for{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>Athletes</Box>.
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ opacity: 0.85, lineHeight: 1.6, mb: 4 }}>
            Next-gen AI pose analysis, real-time audio rep coaching, and automated progression tracking — all in one place.
          </Typography>

          {/* Quick value props */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Real-time computer vision movement feedback</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SpeedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Gamified XP, streaks, and community leaderboard</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Fast, seamless, and secure 1-click Google authentication</Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer info */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} FitForge Inc. Precision biomechanics & fitness AI.
          </Typography>
        </Box>
      </Box>

      {/* Right authentication panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6, md: 8 },
          background: '#0a0a0f',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Mobile branding */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <FitnessCenterIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em">
                FitForge
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 5 },
                borderRadius: 4,
                bgcolor: 'rgba(18, 18, 26, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} mb={1.2} letterSpacing="-0.02em">
                  Get Started
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto' }}>
                  Sign in or create your FitForge account instantly with Google.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2.5 }}>
                  {error}
                </Alert>
              )}

              {!clientId && (
                <Alert severity="warning" sx={{ mb: 3.5, borderRadius: 2.5 }}>
                  <strong>Google Client ID missing:</strong> Please set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your <code>.env.local</code> file.
                </Alert>
              )}

              {/* Google Button Container */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 64,
                  position: 'relative',
                  my: 2,
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                    <CircularProgress size={36} sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Authenticating securely with Google...
                    </Typography>
                  </Box>
                ) : clientId ? (
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      '& > div': { width: '100% !important' },
                      '& iframe': { margin: '0 auto !important' },
                    }}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                      theme="filled_black"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      width={380}
                    />
                  </Box>
                ) : null}
              </Box>

              {/* Security reassurance */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 3.5,
                  pt: 3,
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <SecurityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  One-click sign up & login • No password required
                </Typography>
              </Box>
            </Paper>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 3, px: 2, opacity: 0.7 }}
            >
              By continuing, you agree to FitForge&apos;s Terms of Service and Privacy Policy.
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
