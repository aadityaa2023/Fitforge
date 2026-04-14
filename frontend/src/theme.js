// src/theme.js — Dark MUI theme with neon green + purple palette
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00E676",
      light: "#69f0ae",
      dark: "#00b248",
      contrastText: "#000000",
    },
    secondary: {
      main: "#7C4DFF",
      light: "#b47cff",
      dark: "#3f1dcb",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0a0a0f",
      paper: "#12121a",
    },
    text: {
      primary: "#f0f0f5",
      secondary: "#9e9eb5",
    },
    error: { main: "#ff5252" },
    warning: { main: "#ffab40" },
    success: { main: "#00E676" },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.02em" },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #00E676 0%, #00b248 100%)",
          boxShadow: "0 4px 20px rgba(0,230,118,0.35)",
          "&:hover": {
            boxShadow: "0 6px 28px rgba(0,230,118,0.5)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(18,18,26,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease",
          "&:hover": {
            border: "1px solid rgba(0,230,118,0.2)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
            "&:hover fieldset": { borderColor: "rgba(0,230,118,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#00E676" },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 8 },
        bar: {
          background: "linear-gradient(90deg, #00E676, #00b248)",
          borderRadius: 99,
        },
      },
    },
  },
});

export default theme;
