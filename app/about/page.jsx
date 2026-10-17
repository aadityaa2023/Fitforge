'use client';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useAuth } from '@/context/AuthContext';

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', color: '#242428' }}>
      <PublicNavbar />

      {/* Hero Header with Strava-style background image */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '380px', md: '480px' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.55) 60%, rgba(0, 0, 0, 0.4) 100%),
            url("/gym-bg.jpg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FFFFFF',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, md: 8 } }}>
          <Box sx={{ maxWidth: 740 }}>
            <Typography
              variant="overline"
              sx={{
                color: '#FC5200',
                fontWeight: 900,
                letterSpacing: '0.12em',
                fontSize: '0.85rem',
                display: 'block',
                mb: 1.5,
              }}
            >
              ABOUT FITFORGE
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                mb: 2.5,
              }}
            >
              Connecting athletes to what motivates them.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.6,
                maxWidth: 620,
              }}
            >
              FitForge is built for anyone who works out. We believe when people move, good things happen.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, borderBottom: '1px solid #E5E7EB' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="overline"
                sx={{ color: '#FC5200', fontWeight: 900, letterSpacing: '0.1em', display: 'block', mb: 1 }}
              >
                OUR PURPOSE
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  letterSpacing: '-0.025em',
                  color: '#1F2937',
                  mb: 2.5,
                  lineHeight: 1.15,
                }}
              >
                Technology in service of human movement.
              </Typography>
              <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.7, fontSize: '1.05rem', mb: 2 }}>
                We make tools that help athletes record workouts, measure consistency, and analyze biomechanics without expensive gear.
              </Typography>
              <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.7, fontSize: '1.05rem' }}>
                With computer vision right in your browser, every rep of every squat, press, and lunge is tracked and verified.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                }}
              >
                <Box
                  component="img"
                  src="/gym-bg.jpg"
                  alt="Athletes training"
                  sx={{ width: '100%', height: { xs: 260, sm: 340 }, objectFit: 'cover', display: 'block' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Strava 3 Pillars */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#FC5200', fontWeight: 900, letterSpacing: '0.1em' }}>
              OUR BELIEFS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '1.85rem', md: '2.5rem' }, color: '#1F2937', mt: 1 }}>
              Built for Lifters, Run by Athletes
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                title: 'Fair & Verified Reps',
                desc: 'Standardized biomechanical depth ensures competition-grade tracking. Keep yourself honest with computer vision angle analysis.',
              },
              {
                title: 'Privacy Guaranteed',
                desc: 'Your camera stream never leaves your personal device. Frame inference is executed locally using on-device WebAssembly.',
              },
              {
                title: 'Unbreakable Community',
                desc: 'Athletes fuel athletes. Celebrate personal records, give kudos, climb leaderboards, and keep your daily streak alive.',
              },
            ].map((pillar, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '4px',
                    p: 4,
                    height: '100%',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2937', mb: 1.5 }}>
                    {pillar.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {pillar.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Join the Movement CTA */}
      <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1F2937', mb: 2 }}>
            Join the FitForge Community
          </Typography>
          <Typography variant="body1" sx={{ color: '#4B5563', mb: 4 }}>
            Ready to track your workouts with athletes worldwide? Sign up for free today.
          </Typography>
          <Button
            component={Link}
            href={user ? '/dashboard' : '/login'}
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#FC5200',
              color: '#FFFFFF',
              py: 1.8,
              px: 5,
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '3px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#E04800', boxShadow: 'none' },
            }}
          >
            {user ? 'Open Dashboard' : 'Join for free'}
          </Button>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
}
