'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Alert, CircularProgress,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import StravaBrandLogo from '@/components/StravaBrandLogo';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url("/gym-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Strava-style Top Header Bar */}
      <Box
        sx={{
          width: '100%',
          py: 2,
          px: { xs: 2.5, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <StravaBrandLogo size="medium" href="/" />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            component="a"
            href="/"
            variant="body2"
            sx={{
              color: '#333',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': { color: '#FC5200' },
            }}
          >
            ← Back to Home
          </Typography>
        </Box>
      </Box>

      {/* Main Centered Login Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 6,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'rgba(15, 15, 15, 0.92)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            p: { xs: 3, sm: 4.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header Title */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            Log In
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 3.5,
              fontSize: '0.9rem',
            }}
          >
            Sign in to track workouts and compete with athletes.
          </Typography>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 1.5, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          {/* Missing client ID notice if applicable */}
          {!clientId && (
            <Alert severity="warning" sx={{ mb: 3, width: '100%', borderRadius: 1.5, textAlign: 'left' }}>
              Google Client ID missing in <code>.env.local</code>
            </Alert>
          )}

          {/* Google Button */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 52,
              mb: 3.5,
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} sx={{ color: '#FC5200' }} />
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Signing in with Google...
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
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </Box>
            ) : null}
          </Box>

          {/* Subtle separator */}
          <Box
            sx={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              mb: 3,
            }}
          />

          {/* Guarantee / Security info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 17, color: '#FC5200' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              One-click sign up &amp; login • No password required
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
