// pages/Achievements.jsx
import { useEffect, useState } from "react";
import { Box, Grid, Typography, TextField, InputAdornment, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion } from "framer-motion";
import AchievementCard from "../components/AchievementCard";
import { gamificationApi } from "../services/auth";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0); // 0=All, 1=Unlocked, 2=Locked

  useEffect(() => {
    gamificationApi.getAchievements().then(setAchievements);
  }, []);

  const filtered = achievements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === 0 ? true : tab === 1 ? a.unlocked : !a.unlocked;
    return matchSearch && matchTab;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Achievements</Typography>
            <Typography color="text.secondary">
              {unlockedCount}/{achievements.length} unlocked
            </Typography>
          </Box>
          <TextField
            id="achievement-search"
            placeholder="Search achievements…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>
      </motion.div>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600 } }}
      >
        <Tab id="tab-all" label={`All (${achievements.length})`} />
        <Tab id="tab-unlocked" label={`Unlocked (${unlockedCount})`} />
        <Tab id="tab-locked" label={`Locked (${achievements.length - unlockedCount})`} />
      </Tabs>

      <Grid container spacing={2.5}>
        {filtered.map((ach, idx) => (
          <Grid item xs={12} sm={6} md={4} key={ach.id}>
            <AchievementCard achievement={ach} index={idx} />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <EmojiEventsIcon sx={{ fontSize: "3rem", color: "text.secondary" }} />
              <Typography color="text.secondary" mt={1}>No achievements found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
