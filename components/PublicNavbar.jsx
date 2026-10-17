'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/context/AuthContext';
import StravaBrandLogo from '@/components/StravaBrandLogo';

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #DFDFDF',
          color: '#242428',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
          <Toolbar disableGutters sx={{ height: 68, display: 'flex', justifyContent: 'space-between' }}>
            {/* Strava Wordmark & Primary Nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 5 } }}>
              <StravaBrandLogo size="medium" href="/" />

              {/* Strava Horizontal Nav */}

              {/* Strava Horizontal Nav */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
                {NAV_LINKS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? '#FC5200' : '#242428',
                          fontSize: '0.93rem',
                          position: 'relative',
                          transition: 'color 0.15s ease',
                          '&:hover': { color: '#FC5200' },
                          '&::after': isActive
                            ? {
                                content: '""',
                                position: 'absolute',
                                bottom: -24,
                                left: 0,
                                right: 0,
                                height: 3,
                                bgcolor: '#FC5200',
                              }
                            : {},
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Link>
                  );
                })}
              </Box>
            </Box>

            {/* Right Buttons: Log In & Join for free */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2.5 }}>
              {user ? (
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  sx={{
                    borderRadius: '3px',
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    bgcolor: '#FC5200',
                    color: '#FFFFFF',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#E04800', boxShadow: 'none' },
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/login"
                    variant="text"
                    sx={{
                      color: '#242428',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.92rem',
                      px: 1.5,
                      '&:hover': { color: '#FC5200', bgcolor: 'transparent' },
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    component={Link}
                    href="/login"
                    variant="contained"
                    sx={{
                      borderRadius: '3px',
                      px: 3,
                      py: 1,
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      textTransform: 'none',
                      bgcolor: '#FC5200',
                      color: '#FFFFFF',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#E04800', boxShadow: 'none' },
                    }}
                  >
                    Join for free
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile hamburger icon */}
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#242428' }}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        slotProps={{
          backdrop: { keepMounted: true },
          paper: {
            sx: {
              width: 290,
              bgcolor: '#FFFFFF',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <StravaBrandLogo size="small" href="/" />
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#242428' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ flex: 1 }}>
          {NAV_LINKS.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 1,
                  bgcolor: pathname === item.href ? 'rgba(252, 82, 0, 0.08)' : 'transparent',
                  color: pathname === item.href ? '#FC5200' : '#242428',
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: pathname === item.href ? 700 : 600, fontSize: '0.95rem' }}>
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            component={Link}
            href="/login"
            onClick={handleDrawerToggle}
            variant="contained"
            fullWidth
            sx={{
              py: 1.3,
              fontWeight: 700,
              bgcolor: '#FC5200',
              color: '#FFFFFF',
              borderRadius: '3px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#E04800', boxShadow: 'none' },
            }}
          >
            {user ? 'Open Dashboard' : 'Join for free'}
          </Button>
          {!user && (
            <Button
              component={Link}
              href="/login"
              onClick={handleDrawerToggle}
              variant="outlined"
              fullWidth
              sx={{
                py: 1.3,
                fontWeight: 700,
                borderColor: '#DFDFDF',
                color: '#242428',
                borderRadius: '3px',
                textTransform: 'none',
                '&:hover': { borderColor: '#FC5200', color: '#FC5200', bgcolor: 'transparent' },
              }}
            >
              Log In
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
}
