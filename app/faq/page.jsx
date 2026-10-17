'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function FAQPage() {
  const [expanded, setExpanded] = useState('panel0');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      q: 'Do I need any special camera, hardware, or sensors to use FitForge?',
      a: 'No. FitForge runs directly in modern desktop and mobile web browsers (Chrome, Edge, Safari, Firefox). All you need is any standard laptop webcam or smartphone camera.',
    },
    {
      q: 'Is my video footage recorded or sent to FitForge servers?',
      a: 'No. Athlete privacy is guaranteed. Camera frames are processed strictly in your local device memory using on-device WebAssembly and GPU acceleration. No video feeds or images are ever uploaded or stored on our servers.',
    },
    {
      q: 'Which movements and exercises does the computer vision model track?',
      a: 'FitForge currently tracks squats, pushups, lunges, lateral raises, overhead shoulder presses, and jumping jacks. The system monitors 33 joint landmarks and validates range-of-motion angles before counting a completed repetition.',
    },
    {
      q: 'How does the AI Workout Planner create personalized routines?',
      a: 'The planner factors in your training goals (hypertrophy, endurance, athletic conditioning), available training days, session duration, and available equipment to synthesize progressive overload routines.',
    },
    {
      q: 'How do streaks, XP, and leaderboards work?',
      a: 'Completed reps and finished workout sessions award experience points (XP). Training consistently builds your daily streak counter and places you on community leaderboards with athletes worldwide.',
    },
    {
      q: 'Is FitForge free to use?',
      a: 'Yes! FitForge offers a 100% free tier that includes live camera tracking, automated rep counts, streak tracking, and community leaderboard placement. Simply sign in with your Google account to get started.',
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
            HELP &amp; FAQ
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
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '1.15rem', color: '#4B5563', maxWidth: 580, mx: 'auto' }}
          >
            Everything you need to know about workout tracking, camera privacy, and athletic scoring on FitForge.
          </Typography>
        </Container>
      </Box>

      {/* Accordions */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {faqs.map((faq, index) => {
            const panelId = `panel${index}`;
            const isCurrent = expanded === panelId;
            return (
              <Accordion
                key={index}
                expanded={isCurrent}
                onChange={handleChange(panelId)}
                elevation={0}
                sx={{
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px !important',
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                  '&:hover': { borderColor: '#D1D5DB' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: isCurrent ? '#FC5200' : '#6B7280' }} />}
                  sx={{ px: 3, py: 1 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: isCurrent ? '#FC5200' : '#1F2937',
                    }}
                  >
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        {/* Still have questions */}
        <Box sx={{ mt: 8, p: 4, bgcolor: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '4px', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1F2937', mb: 1 }}>
            Still have questions?
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 2.5 }}>
            Our athlete support team is ready to help you with any questions or technical issues.
          </Typography>
          <Link
            href="/contact"
            style={{
              color: '#FC5200',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.95rem',
            }}
          >
            Contact FitForge Support →
          </Link>
        </Box>
      </Container>

      <PublicFooter />
    </Box>
  );
}
