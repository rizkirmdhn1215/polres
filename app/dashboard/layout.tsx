'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import HeaderNotification from '../components/HeaderNotification';

const DRAWER_WIDTH = 240;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Profil', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Laporan', icon: <DescriptionIcon />, path: '/dashboard/reports' },
    { text: 'Notifikasi', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
  ];

  const drawer = (
    <Box className="h-full bg-white">
      {/* Sidebar Header */}
      <Box className="p-4 border-b flex items-center justify-between">
        <Box className="flex items-center gap-2">
          <SecurityOutlinedIcon className="text-blue-600" />
          <Typography variant="subtitle1" className="font-bold">
            POLRES PAYAKUMBUH
          </Typography>
        </Box>
        {mobileOpen && (
          <IconButton onClick={handleDrawerToggle} className="md:hidden">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* User Profile Section */}
      <Box className="p-4 border-b">
        <Box className="flex items-center gap-3 mb-3">
          <Avatar
            src={user?.photoURL || undefined}
            alt={user?.displayName || 'User'}
          />
          <Box>
            <Typography variant="subtitle2" className="font-semibold">
              {user?.displayName || 'User'}
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            href={item.path}
            onClick={() => setMobileOpen(false)}
            className={`mx-2 rounded-lg ${
              pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <ListItemIcon className={pathname === item.path ? 'text-blue-600' : ''}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box className="absolute bottom-0 w-full p-4 border-t">
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box className="flex flex-col min-h-screen bg-[#e2e8f0]">
      {/* Main content wrapper */}
      <Box className="flex flex-1">
        {/* Sidebar - Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>

        {/* Content area with notification */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            position: 'relative'
          }}
        >
          {/* Header Notification - Positioned relative to content area */}
          <Box sx={{ 
            position: 'fixed',
            top: 0,
            right: 0,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            zIndex: 50
          }}>
            <HeaderNotification />
          </Box>

          {/* Main content with padding for notification */}
          <Box className="pt-10">
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 