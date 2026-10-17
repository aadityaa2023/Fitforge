'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Alert, CircularProgress,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        px: 3,
        py: 4,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            mb: 1.5,
            fontSize: { xs: '2.2rem', sm: '2.5rem' },
          }}
        >
          Get Started
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: '#9ca3af',
            lineHeight: 1.5,
            mb: 4.5,
            maxWidth: 340,
            fontSize: '1rem',
          }}
        >
          Sign in or create your FitForge account instantly with Google.
        </Typography>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Missing client ID notice if applicable */}
        {!clientId && (
          <Alert severity="warning" sx={{ mb: 3, width: '100%', borderRadius: 2 }}>
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
            mb: 4,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
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
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
                width={360}
              />
            </Box>
          ) : null}
        </Box>

        {/* Divider line */}
        <Box
          sx={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            mb: 3,
          }}
        />

        {/* Footer info: One-click sign up & login */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: '#9ca3af',
          }}
        >
          <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
          <Typography
            variant="body2"
            sx={{
              color: '#d1d5db',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            One-click sign up &amp; login • No password required
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
