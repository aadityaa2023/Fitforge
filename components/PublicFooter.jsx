'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import StravaBrandLogo from '@/components/StravaBrandLogo';

export default function PublicFooter() {
  const [language, setLanguage] = useState('en-US');

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        pt: { xs: 8, md: 10 },
        pb: 8,
        color: '#242428',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, md: 8 } }}>
        <Grid container spacing={6}>
          {/* Brand Wordmark & Language Selector */}
          <Grid item xs={12} md={3}>
            <Box sx={{ mb: 3 }}>
              <StravaBrandLogo size="large" href="/" />
            </Box>

            {/* Language Selector Dropdown (Exact Strava style) */}
            <Box sx={{ mt: 1, maxWidth: 220 }}>
              <FormControl size="small" fullWidth>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '3px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#242428',
                    border: '1px solid #DFDFDF',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '&:hover': { borderColor: '#B0B0B0' },
                  }}
                >
                  <MenuItem value="en-US">English (US)</MenuItem>
                  <MenuItem value="en-GB">English (UK)</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="it">Italiano</MenuItem>
                  <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Column 1: About */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#242428',
                letterSpacing: '-0.01em',
                mb: 2.2,
                fontSize: '0.95rem',
              }}
            >
              About
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                About FitForge
              </Link>
              <Link href="/features" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Features &amp; Tech
              </Link>
              <Link href="/pricing" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Subscription Plans
              </Link>
              <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Careers
              </Link>
              <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Business
              </Link>
            </Box>
          </Grid>

          {/* Column 2: Explore */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#242428',
                letterSpacing: '-0.01em',
                mb: 2.2,
                fontSize: '0.95rem',
              }}
            >
              Explore
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Link href="/login" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Live Workout Camera
              </Link>
              <Link href="/login" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                AI Workout Planner
              </Link>
              <Link href="/leaderboard" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Global Leaderboard
              </Link>
              <Link href="/login" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Athletic XP &amp; Badges
              </Link>
              <Link href="/features" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Supported Exercises
              </Link>
            </Box>
          </Grid>

          {/* Column 3: Follow */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#242428',
                letterSpacing: '-0.01em',
                mb: 2.2,
                fontSize: '0.95rem',
              }}
            >
              Follow
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Link href="https://facebook.com" target="_blank" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FacebookIcon sx={{ fontSize: 18 }} /> Facebook
              </Link>
              <Link href="https://twitter.com" target="_blank" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TwitterIcon sx={{ fontSize: 18 }} /> Twitter
              </Link>
              <Link href="https://instagram.com" target="_blank" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <InstagramIcon sx={{ fontSize: 18 }} /> Instagram
              </Link>
              <Link href="https://youtube.com" target="_blank" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <YouTubeIcon sx={{ fontSize: 18 }} /> YouTube
              </Link>
            </Box>
          </Grid>

          {/* Column 4: Help */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#242428',
                letterSpacing: '-0.01em',
                mb: 2.2,
                fontSize: '0.95rem',
              }}
            >
              Help
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
              <Link href="/faq" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                FitForge Support
              </Link>
              <Link href="/contact" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Contact Us
              </Link>
              <Link href="/faq" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Community Forum
              </Link>
              <Link href="/features" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.9rem' }}>
                Webcam &amp; Lighting Tips
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Legal, Privacy & Copyright */}
        <Box
          sx={{
            mt: 8,
            pt: 4,
            borderTop: '1px solid #DFDFDF',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
            <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.85rem' }}>
              Privacy Policy
            </Link>
            <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.85rem' }}>
              Terms and Conditions
            </Link>
            <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.85rem' }}>
              Notice at Collection
            </Link>
            <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.85rem' }}>
              Cookie Preferences
            </Link>
            <Link href="/about" style={{ textDecoration: 'none', color: '#6D6D78', fontSize: '0.85rem' }}>
              Do Not Share My Personal Information
            </Link>
          </Box>

          <Typography variant="caption" sx={{ color: '#6D6D78', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} FitForge
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
