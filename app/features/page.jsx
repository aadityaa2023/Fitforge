'use client';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
} from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useAuth } from '@/context/AuthContext';

export default function FeaturesPage() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Pose Analysis',
      desc: 'Real-time 33-point body tracking calculated directly in your browser. Measures joint flexion at knees, hips, and elbows.',
      icon: <CameraAltOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: '60 FPS client inference',
    },
    {
      title: 'AI Workout Planner',
      desc: 'Personalized training splits built around your muscle group targets, experience level, workout schedule, and equipment.',
      icon: <TimelineOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: 'Dynamic overload schemes',
    },
    {
      title: 'Live Voice Audio',
      desc: 'Audible coaching cues such as "Squat deeper", "Keep chest upright", and "Good rep" so you stay focused on your lift.',
      icon: <VolumeUpOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: 'Hands-free workout coaching',
    },
    {
      title: 'XP & Leaderboards',
      desc: 'Earn experience points for each verified repetition. Maintain daily workout streaks and climb community leaderboards.',
      icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: 'Gamified athletic ranks',
    },
    {
      title: 'Workout Telemetry',
      desc: 'Deep-dive into volume per exercise, strength trends over time, estimated 1RM calculations, and weekly tonnage splits.',
      icon: <ShowChartOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: 'Clear strength curves',
    },
    {
      title: 'On-Device Privacy',
      desc: 'Your camera stream remains strictly on your device. Video frames are analyzed in local device memory and discarded immediately.',
      icon: <ShieldOutlinedIcon sx={{ fontSize: 28, color: '#FC5200' }} />,
      detail: 'Zero cloud camera uploads',
    },
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
            TECHNOLOGY &amp; FEATURES
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
            Engineered for athletic precision.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '1.15rem', color: '#4B5563', maxWidth: 600, mx: 'auto' }}
          >
            Explore the computer vision, training telemetry, and motivation features that help athletes get the most out of every workout.
          </Typography>
        </Container>
      </Box>

      {/* Compact 2 Rows x 3 Columns Cards Grid */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={2.5} justifyContent="center">
          {features.map((feat, idx) => (
            <Grid item xs={12} sm={4} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px',
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    borderColor: '#FC5200',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                  },
                }}
              >
                {/* Card Top: Icon & Title */}
                <Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '4px',
                      bgcolor: 'rgba(252, 82, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                    }}
                  >
                    {feat.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.8, fontSize: '1.02rem', lineHeight: 1.3 }}>
                    {feat.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6B7280',
                      lineHeight: 1.5,
                      fontSize: '0.82rem',
                    }}
                  >
                    {feat.desc}
                  </Typography>
                </Box>

                {/* Card Bottom / Detail */}
                <Box sx={{ pt: 1.5, mt: 2, borderTop: '1px solid #F3F4F6' }}>
                  <Typography variant="caption" sx={{ color: '#FC5200', fontWeight: 700, fontSize: '0.75rem' }}>
                    {feat.detail}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
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
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}
