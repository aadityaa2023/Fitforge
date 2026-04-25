'use client';
import { useEffect, useState } from 'react';
import { Box, Grid, Typography, TextField, InputAdornment, Tabs, Tab, Card, CardContent, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { gamificationApi } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import ProtectedLayout from '@/components/ProtectedLayout';

function AchievementCard({ achievement, index }) {
  const { title, description, xp_reward, unlocked } = achievement;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }} style={{ height: '100%' }}>
      <Card sx={{ height: '100%', opacity: unlocked ? 1 : 0.55, position: 'relative', overflow: 'hidden' }}>
        {unlocked && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }} />
        )}
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: unlocked ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unlocked ? <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 24 }} /> : <LockIcon sx={{ color: 'text.secondary', fontSize: 24 }} />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={700} color={unlocked ? 'text.primary' : 'text.secondary'}>{title}</Typography>
              <Chip label={`+${xp_reward} XP`} size="small" sx={{ bgcolor: unlocked ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)', color: unlocked ? '#FFD700' : 'text.secondary', fontWeight: 700, mt: 0.5 }} />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
          {unlocked && (
            <Box sx={{ mt: 1.5, px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="#FFD700" fontWeight={700}>✓ Unlocked</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    gamificationApi.getAchievements().then(setAchievements).catch(()=>{});
  }, [user]);

  const filtered = achievements.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 0 ? true : tab === 1 ? a.unlocked : !a.unlocked;
    return matchSearch && matchTab;
  });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <ProtectedLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>Achievements</Typography>
              <Typography color="text.secondary">{unlockedCount}/{achievements.length} unlocked</Typography>
            </Box>
            <TextField
              id="achievement-search" placeholder="Search achievements…" size="small"
              value={search} onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>) } }}
              sx={{ width: 250 }}
            />
          </Box>
        </motion.div>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600 } }}>
          <Tab id="tab-all" label={`All (${achievements.length})`} />
          <Tab id="tab-unlocked" label={`Unlocked (${unlockedCount})`} />
          <Tab id="tab-locked" label={`Locked (${achievements.length - unlockedCount})`} />
        </Tabs>

        <Grid container spacing={2.5}>
          {filtered.map((ach, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ach.id}>
              <AchievementCard achievement={ach} index={idx} />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EmojiEventsIcon sx={{ fontSize: '3rem', color: 'text.secondary' }} />
                <Typography color="text.secondary" mt={1}>No achievements found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </ProtectedLayout>
  );
}
