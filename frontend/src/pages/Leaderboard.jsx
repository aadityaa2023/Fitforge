// pages/Leaderboard.jsx — Top-10 users by XP
import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Skeleton,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { gamificationApi } from "../services/auth";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const RANK_COLORS = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
const RANK_ICONS = { 1: <LooksOneIcon fontSize="large" />, 2: <LooksTwoIcon fontSize="large" />, 3: <Looks3Icon fontSize="large" /> };
const LEVEL_COLORS = {
  Beginner: "#9e9e9e", Novice: "#4caf50", Intermediate: "#2196f3",
  Advanced: "#9c27b0", Elite: "#ff9800",
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationApi.getLeaderboard().then(setBoard).finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <EmojiEventsIcon sx={{ fontSize: 36, color: "#FFD700" }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>Leaderboard</Typography>
            <Typography color="text.secondary">Top athletes by total XP</Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Top 3 podium cards */}
      {!loading && board.length >= 3 && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          {[board[1], board[0], board[2]].map((entry, visualIdx) => {
            const rank = entry.rank;
            const isMid = visualIdx === 1; // gold (1st) in middle
            const color = RANK_COLORS[rank] || "#fff";
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: visualIdx * 0.1, duration: 0.5 }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${color}15, transparent)`,
                    border: `1px solid ${color}44`,
                    width: isMid ? 160 : 130,
                    mb: isMid ? 0 : 2,
                  }}
                >
                  <Box sx={{ mb: 1, color }}>{RANK_ICONS[rank]}</Box>
                  <Avatar
                    sx={{
                      mx: "auto",
                      mb: 1,
                      width: isMid ? 56 : 44,
                      height: isMid ? 56 : 44,
                      bgcolor: `${color}33`,
                      color: color,
                      fontWeight: 800,
                      fontSize: isMid ? "1.3rem" : "1rem",
                    }}
                  >
                    {entry.username[0].toUpperCase()}
                  </Avatar>
                  <Typography
                    variant={isMid ? "body1" : "body2"}
                    fontWeight={700}
                    noWrap
                    sx={{ color: entry.username === user?.username ? "primary.main" : "text.primary" }}
                  >
                    {entry.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color, fontWeight: 800, fontSize: isMid ? "1rem" : "0.85rem" }}>
                    {entry.xp.toLocaleString()} XP
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      )}

      {/* Full table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
        <Card>
          <TableContainer>
            <Table id="leaderboard-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary", width: 60 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Athlete</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Level</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>XP</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary" }}>Streak</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? [1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : board.map((entry) => {
                      const isMe = entry.username === user?.username;
                      const levelColor = LEVEL_COLORS[entry.level_name] || "#9e9e9e";
                      return (
                        <TableRow
                          key={entry.id}
                          id={`leaderboard-row-${entry.rank}`}
                          sx={{
                            bgcolor: isMe ? "rgba(0,230,118,0.05)" : "transparent",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                          }}
                        >
                          <TableCell>
                            <Typography
                              fontWeight={800}
                              sx={{ color: RANK_COLORS[entry.rank] || "text.secondary", display: 'flex', alignItems: 'center' }}
                            >
                              {RANK_ICONS[entry.rank] || `#${entry.rank}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: isMe ? "rgba(0,230,118,0.2)" : "rgba(255,255,255,0.06)",
                                  color: isMe ? "primary.main" : "text.primary",
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {entry.username[0].toUpperCase()}
                              </Avatar>
                              <Typography fontWeight={isMe ? 700 : 500} color={isMe ? "primary.main" : "text.primary"}>
                                {entry.username} {isMe && "(You)"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.level_name}
                              size="small"
                              sx={{ bgcolor: `${levelColor}1a`, color: levelColor, fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={700} color="primary.main">
                              {entry.xp.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="warning.main" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              <LocalFireDepartmentIcon fontSize="small" /> {entry.streak}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </motion.div>
    </Box>
  );
}
