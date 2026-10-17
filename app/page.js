'use client';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Exact Strava Header / Navbar */}
      <PublicNavbar />

      {/* 2. Exact Strava Hero Section with background gym image */}
      <Box
        component="main"
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: { xs: 'calc(100vh - 68px)', md: '720px' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.62) 50%, rgba(0, 0, 0, 0.45) 100%),
            url("/gym-bg.jpg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, md: 8 }, py: { xs: 8, md: 12 } }}>
          <Grid container>
            <Grid item xs={12} md={8} lg={7}>
              {/* Strava Category Tag */}
              <Typography
                variant="overline"
                sx={{
                  color: '#FC5200',
                  fontWeight: 900,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  display: 'block',
                  mb: 2,
                }}
              >
                THE ATHLETE'S PLATFORM
              </Typography>

              {/* Strava Giant Hero Headline */}
              <Typography
                variant="h1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.75rem', lg: '5.25rem' },
                  lineHeight: 1.02,
                  letterSpacing: '-0.035em',
                  mb: 3,
                  textTransform: 'none',
                }}
              >
                The #1 app for athletes.
              </Typography>

              {/* Subtitle description */}
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.45rem' },
                  fontWeight: 400,
                  lineHeight: 1.5,
                  mb: 5,
                  maxWidth: 620,
                }}
              >
                Record workouts, track reps with computer vision, analyze your form in real-time, and compete with athletes worldwide.
              </Typography>

              {/* Strava CTA Button */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2.5, alignItems: { sm: 'center' } }}>
                <Button
                  component={Link}
                  href={user ? '/dashboard' : '/login'}
                  variant="contained"
                  sx={{
                    bgcolor: '#FC5200',
                    color: '#FFFFFF',
                    py: 2,
                    px: { xs: 4, sm: 6 },
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: '4px',
                    textTransform: 'none',
                    letterSpacing: '0.01em',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#E04800',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {user ? 'Open Dashboard' : 'Join for free'}
                </Button>

                {!user && (
                  <Typography
                    component={Link}
                    href="/login"
                    variant="body2"
                    sx={{
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': { color: '#FC5200' },
                    }}
                  >
                    Already a member? <span style={{ textDecoration: 'underline' }}>Log In</span>
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Exact Strava Charcoal Footer */}
      <PublicFooter />
    </Box>
  );
}
