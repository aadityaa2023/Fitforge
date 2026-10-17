'use client';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useAuth } from '@/context/AuthContext';

export default function PricingPage() {
  const { user } = useAuth();

  const freeFeatures = [
    'Real-time webcam pose detection & rep counting',
    'Full exercise library: Squats, Pushups, Lunges & Lateral Raises',
    '33-point biomechanical joint angle verification',
    'Live audio coaching prompts and rep counts',
    'Daily workout streaks & athletic XP ranking',
    'Global & community athlete leaderboards',
    '100% private on-device video frame processing',
    'Unlimited workouts with zero credit card required',
  ];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', color: '#242428' }}>
      <PublicNavbar />

      {/* Header */}
      <Box sx={{ bgcolor: '#FAFAFA', borderBottom: '1px solid #E5E7EB', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{ color: '#FC5200', fontWeight: 900, letterSpacing: '0.12em', display: 'block', mb: 1 }}
          >
            FREE FOR ALL ATHLETES
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.75rem' },
              letterSpacing: '-0.03em',
              color: '#1F2937',
              mb: 2,
            }}
          >
            Train without limits.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '1.15rem', color: '#4B5563', maxWidth: 580, mx: 'auto' }}
          >
            Access our core computer vision pose tracking, automated rep counts, and community leaderboards completely free.
          </Typography>
        </Container>
      </Box>

      {/* Single Free Card Section */}
      <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
        <Card
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            border: '2px solid #FC5200', // Signature Strava Orange Highlight
            borderRadius: '4px',
            p: { xs: 4, sm: 5 },
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 24,
              bgcolor: '#FC5200',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              px: 1.8,
              py: 0.4,
              borderRadius: '3px',
              textTransform: 'uppercase',
            }}
          >
            100% Free
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, color: '#1F2937', mb: 1 }}>
            FitForge Free
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, fontSize: '0.95rem' }}>
            Complete browser-based workout tracking and coaching for dedicated athletes.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#1F2937', lineHeight: 1 }}>
              $0
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
              forever • no credit card needed
            </Typography>
          </Box>

          <Button
            component={Link}
            href={user ? '/dashboard' : '/login'}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              my: 3.5,
              py: 1.8,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: '3px',
              boxShadow: 'none',
              bgcolor: '#FC5200',
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: '#E04800',
                boxShadow: 'none',
              },
            }}
          >
            {user ? 'Open Dashboard' : 'Join for free with Google'}
          </Button>

          <Divider sx={{ my: 2, borderColor: '#F3F4F6' }} />

          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: '#1F2937',
              textTransform: 'uppercase',
              mb: 2.5,
              display: 'block',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
            }}
          >
            Included with every account:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            {freeFeatures.map((feat, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CheckIcon sx={{ fontSize: 20, color: '#FC5200', mt: '1px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {feat}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Container>

      <PublicFooter />
    </Box>
  );
}
