'use client';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export default function StravaBrandLogo({ size = 'medium', href = '/' }) {
  // Size presets
  const sizeMap = {
    small: { fontSize: '1.4rem', letterSpacing: '-0.04em' },
    medium: { fontSize: '1.75rem', letterSpacing: '-0.045em' },
    large: { fontSize: '2.1rem', letterSpacing: '-0.05em' },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  const content = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 900,
          fontStyle: 'normal', // Strava's modern wordmark is upright, ultra-heavy geometric bold
          textTransform: 'uppercase',
          color: '#FC5200', // Signature Strava Orange
          fontSize: currentSize.fontSize,
          letterSpacing: currentSize.letterSpacing,
          lineHeight: 0.95,
          display: 'inline-block',
          transform: 'scaleY(0.96)', // matches Strava's slightly condensed solid geometric block look
        }}
      >
        FITFORGE
      </Typography>
    </Box>
  );

  if (!href) return content;

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
      {content}
    </Link>
  );
}
