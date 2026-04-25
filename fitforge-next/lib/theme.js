'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C4DFF',
      light: '#B388FF',
      dark: '#5E35B1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d0d0f',
      paper: '#151518',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
    },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
    divider: 'rgba(255, 255, 255, 0.05)',
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 900, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600, letterSpacing: '0.01em' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '10px 24px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-1px)' },
        },
        containedPrimary: {
          background: 'linear-gradient(145deg, #FF6E40 0%, #FF3D00 100%)',
          boxShadow: '0 4px 12px rgba(255, 61, 0, 0.25)',
          '&:hover': {
            background: 'linear-gradient(145deg, #FF8A65 0%, #FF5252 100%)',
            boxShadow: '0 6px 16px rgba(255, 61, 0, 0.35)',
          },
        },
        outlinedPrimary: {
          borderWidth: '1.5px',
          borderColor: 'rgba(255, 87, 34, 0.5)',
          '&:hover': { borderWidth: '1.5px', background: 'rgba(255, 87, 34, 0.08)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#151518',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          '&:hover': { border: '1px solid rgba(255,255,255,0.12)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#FF5722', borderWidth: '1px' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6, fontWeight: 600 } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0b0b0c',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
        bar: { background: 'linear-gradient(90deg, #FF8A65, #FF3D00)', borderRadius: 4 },
      },
    },
  },
});

export default theme;
