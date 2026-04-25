'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton, Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Workout', icon: <FitnessCenterIcon />, path: '/workout' },
  { label: 'AI Planner', icon: <AutoAwesomeIcon />, path: '/ai-planner', highlight: true },
  { label: 'Progress', icon: <ShowChartIcon />, path: '/progress' },
  { label: 'Achievements', icon: <EmojiEventsIcon />, path: '/achievements' },
  { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard' },
];

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 72;

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
          overflowX: 'hidden',
          position: 'relative', // Change from fixed to relative to stay in flex flow
          height: '100vh',
          background: 'rgba(10,10,18,0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, minHeight: 64 }}>
        {open && (
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', fontWeight: 900, flex: 1, fontSize: '1.3rem', letterSpacing: '-0.02em' }}
          >
            FitForge
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: 'text.secondary' }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {user && (
        <Box sx={{ p: open ? 2 : 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.dark', color: '#fff', fontWeight: 800,
              width: 40, height: 40, fontSize: '0.95rem', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(255, 87, 34, 0.4)',
            }}
          >
            {user.username?.[0]?.toUpperCase()}
          </Avatar>
          {open && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={600} noWrap>{user.username}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {user.streak ?? 0} day streak
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {NAV_ITEMS.map(({ label, icon, path, highlight }) => {
          const isActive = pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!open ? label : ''} placement="right">
                <ListItemButton
                  id={`nav-${label.toLowerCase().replace(' ', '-')}`}
                  onClick={() => router.push(path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    px: open ? 2 : 1.5,
                    justifyContent: open ? 'initial' : 'center',
                    background: isActive
                      ? 'rgba(255, 87, 34, 0.12)'
                      : highlight ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    border: isActive
                      ? '1px solid rgba(255, 87, 34, 0.3)'
                      : highlight ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                    '&:hover': {
                      background: isActive ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.main' : highlight ? 'secondary.main' : 'text.secondary',
                      minWidth: open ? 40 : 'unset',
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isActive ? 700 : highlight ? 700 : 500,
                            color: isActive ? 'primary.main' : highlight ? 'secondary.main' : 'text.secondary',
                            fontSize: '0.9rem',
                          }}
                        >
                          {label}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <Tooltip title={!open ? 'Logout' : ''} placement="right">
            <ListItemButton
              id="nav-logout"
              onClick={handleLogout}
              sx={{
                borderRadius: 2, minHeight: 48,
                px: open ? 2 : 1.5,
                justifyContent: open ? 'initial' : 'center',
                '&:hover': { background: 'rgba(255,82,82,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: open ? 40 : 'unset' }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && (
                <ListItemText
                  disableTypography
                  primary={<Typography sx={{ color: 'error.main', fontWeight: 600 }}>Logout</Typography>}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
}
