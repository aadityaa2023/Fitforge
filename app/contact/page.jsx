'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  TextField,
  Button,
} from '@mui/material';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

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
            SUPPORT &amp; INQUIRIES
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
            How can we help?
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: '1.15rem', color: '#4B5563', maxWidth: 580, mx: 'auto' }}
          >
            Our athlete support team is here to assist with workout tracking questions, account assistance, and exercise feedback.
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={8}>
          {/* Left info */}
          <Grid item xs={12} md={5}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2937', mb: 2 }}>
              FitForge Support
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B7280', lineHeight: 1.7, mb: 4 }}>
              Check out our frequently asked questions or submit an inquiry directly. We typically reply within 1 business day.
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Direct Email
              </Typography>
              <Typography variant="body1" sx={{ color: '#FC5200', fontWeight: 600 }}>
                support@fitforge.ai
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1F2937', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Self-Service Help Center
              </Typography>
              <Link href="/faq" style={{ color: '#242428', textDecoration: 'underline', fontWeight: 600 }}>
                View Frequently Asked Questions →
              </Link>
            </Box>

            <Box sx={{ p: 3, bgcolor: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1F2937', mb: 0.5 }}>
                Camera &amp; Tracking Tip
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', lineHeight: 1.5 }}>
                Make sure your webcam has good front-facing lighting and is placed approximately 6 to 8 feet away so your full body silhouette is visible.
              </Typography>
            </Box>
          </Grid>

          {/* Right form */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                bgcolor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
              }}
            >
              {submitted ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#1F2937', mb: 1.5 }}>
                    Message Sent
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6B7280', mb: 4, maxWidth: 440, mx: 'auto' }}>
                    Thank you for reaching out. We have received your inquiry and will follow up with you at {form.email}.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: '', message: '' });
                    }}
                    sx={{
                      borderColor: '#DFDFDF',
                      color: '#242428',
                      borderRadius: '3px',
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Send another message
                  </Button>
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1F2937', mb: 3 }}>
                    Send a Message
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 0.8 }}>
                        Full Name *
                      </Typography>
                      <TextField
                        required
                        fullWidth
                        size="small"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '3px',
                            bgcolor: '#FFFFFF',
                            '& fieldset': { borderColor: '#DFDFDF' },
                            '&:hover fieldset': { borderColor: '#B0B0B0' },
                            '&.Mui-focused fieldset': { borderColor: '#FC5200' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 0.8 }}>
                        Email Address *
                      </Typography>
                      <TextField
                        required
                        type="email"
                        fullWidth
                        size="small"
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '3px',
                            bgcolor: '#FFFFFF',
                            '& fieldset': { borderColor: '#DFDFDF' },
                            '&:hover fieldset': { borderColor: '#B0B0B0' },
                            '&.Mui-focused fieldset': { borderColor: '#FC5200' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 0.8 }}>
                        Subject
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="What can we help you with?"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '3px',
                            bgcolor: '#FFFFFF',
                            '& fieldset': { borderColor: '#DFDFDF' },
                            '&:hover fieldset': { borderColor: '#B0B0B0' },
                            '&.Mui-focused fieldset': { borderColor: '#FC5200' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 0.8 }}>
                        Message *
                      </Typography>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Please describe your question or issue in detail..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '3px',
                            bgcolor: '#FFFFFF',
                            '& fieldset': { borderColor: '#DFDFDF' },
                            '&:hover fieldset': { borderColor: '#B0B0B0' },
                            '&.Mui-focused fieldset': { borderColor: '#FC5200' },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                          bgcolor: '#FC5200',
                          color: '#FFFFFF',
                          py: 1.5,
                          px: 4,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          borderRadius: '3px',
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#E04800', boxShadow: 'none' },
                        }}
                      >
                        Submit Inquiry
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PublicFooter />
    </Box>
  );
}
