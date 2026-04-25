'use client';
import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { progressApi } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import ProtectedLayout from '@/components/ProtectedLayout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LoopIcon from '@mui/icons-material/Loop';
import BoltIcon from '@mui/icons-material/Bolt';
import FavoriteIcon from '@mui/icons-material/Favorite';

const EXERCISE_ICONS = {
  squat: <DirectionsRunIcon fontSize="large" />,
  pushup: <FitnessCenterIcon fontSize="large" />,
  lunge: <DirectionsRunIcon fontSize="large" />,
  curl: <FitnessCenterIcon fontSize="large" />,
};

function StatsCard({ label, value, icon, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
              <Typography variant="h4" fontWeight={800} color={color || 'primary.main'}>
                {value != null ? (typeof value === 'number' ? value.toLocaleString() : value) : <Skeleton width={60} />}
              </Typography>
            </Box>
            <Box sx={{ color: color || 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(18,18,26,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.name} variant="body2" sx={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</Typography>
      ))}
    </Box>
  );
};

export default function ProgressPage() {
  const [weekly, setWeekly] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    Promise.all([progressApi.getWeekly(), progressApi.getStats()])
      .then(([w, s]) => {
        setWeekly(w.map((d) => ({ ...d, day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }) })));
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ProtectedLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5}>Progress</Typography>
          <Typography color="text.secondary" mb={4}>Your fitness journey at a glance</Typography>
        </motion.div>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}><StatsCard label="Total Workouts" value={stats?.total_workouts} icon={<FitnessCenterIcon fontSize="large" />} color="#A855F7" delay={0.1} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatsCard label="Total Reps" value={stats?.total_reps} icon={<LoopIcon fontSize="large" />} color="#10B981" delay={0.15} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatsCard label="Total XP" value={stats?.total_xp} icon={<BoltIcon fontSize="large" />} color="#ffab40" delay={0.2} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><StatsCard label="Favourite" value={stats ? (stats.favourite_exercise || 'N/A') : null} icon={stats && EXERCISE_ICONS[stats.favourite_exercise] ? EXERCISE_ICONS[stats.favourite_exercise] : <FavoriteIcon fontSize="large" />} color="#ff5252" delay={0.25} /></Grid>
        </Grid>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Weekly Reps</Typography>
              {loading ? <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#9e9eb5', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9e9eb5', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                      <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="reps" fill="url(#repGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Weekly XP Earned</Typography>
              {loading ? <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#9e9eb5', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9e9eb5', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="xp_earned" name="XP" stroke="#A855F7" strokeWidth={2.5} fill="url(#xpGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </ProtectedLayout>
  );
}
