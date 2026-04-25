import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import './globals.css';
import MuiProvider from '@/components/MuiProvider';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'FitForge — AI-Powered Workout Coach',
  description:
    'AI-powered pose analysis, real-time coaching feedback, gamified workouts and personalized nutrition plans.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <MuiProvider>
          <AuthProvider>{children}</AuthProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
