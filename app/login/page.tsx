'use client';
import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Link, Paper, IconButton, Divider } from '@mui/material';
import Image from 'next/image';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { signInWithEmail, signInWithGoogle, getUserRole } from '../firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRoleBasedRedirect = async (uid: string) => {
    try {
      const userRole = await getUserRole(uid);
      
      if (userRole === 'admin') {
        router.push('/admin/dashboard'); // Admin dashboard
      } else {
        router.push('/dashboard'); // Regular user dashboard
      }
    } catch (error) {
      console.error('Error checking role:', error);
      router.push('/dashboard'); // Default fallback
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signInWithEmail(username, password);
      await handleRoleBasedRedirect(result.user.uid);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Email atau password salah');
      } else {
        setError('Terjadi kesalahan saat login');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await signInWithGoogle();
      await handleRoleBasedRedirect(result.user.uid);
    } catch (error: any) {
      console.error('Google login error:', error);
      setError('Terjadi kesalahan saat login dengan Google');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box className="flex h-screen bg-[#e2e8f0]">
      {/* Left side - Image/GIF (60%) */}
      <Box className="hidden md:flex w-[60%] relative">
        <Image
          src="/images/police-image.png"
          alt="Police Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      {/* Right side - Login Form (40%) */}
      <Box className="w-full md:w-[40%] flex items-center justify-center p-8">
        <Paper 
          elevation={24} 
          className="w-full max-w-md p-8 rounded-3xl"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Box className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-blue-50 shadow-inner">
                <SecurityOutlinedIcon 
                  className="text-blue-600" 
                  sx={{ fontSize: 40 }} 
                />
              </div>
            </div>
            <Typography 
              variant="h4" 
              component="h1" 
              className="font-bold mb-2 font-poppins"
              sx={{ 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)'
              }}
            >
              POLRES PAYAKUMBUH
            </Typography>
            <Typography 
              variant="subtitle1" 
              className="text-gray-600 font-inter"
            >
              Pelaporan Kehilangan Barang
            </Typography>
          </Box>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <PersonOutlineIcon className="text-gray-400 mr-2" />
                ),
                sx: {
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }
              }}
              className="mb-4"
            />
            
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LockOutlinedIcon className="text-gray-400 mr-2" />
                ),
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                    size="large"
                    className="text-gray-400"
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                ),
                sx: {
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }
              }}
              className="mb-2"
            />

            <Box className="text-right mb-6">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 font-inter no-underline hover:underline transition-colors duration-200"
              >
                Lupa Password?
              </Link>
            </Box>

            {error && (
              <Typography color="error" className="text-center text-sm mb-4">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
              sx={{
                boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.3)',
                '&:hover': {
                  boxShadow: '0 15px 20px -3px rgba(30, 64, 175, 0.4)',
                }
              }}
            >
              Login
            </Button>

            <Divider className="my-6">atau</Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              sx={{
                borderColor: 'rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: 'rgba(0,0,0,0.2)',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                }
              }}
            >
              Login dengan Google
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
} 