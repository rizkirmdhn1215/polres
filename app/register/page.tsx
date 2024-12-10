'use client';
import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Link, Paper, IconButton } from '@mui/material';
import Image from 'next/image';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailIcon from '@mui/icons-material/Email';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with full name
      await updateProfile(user, {
        displayName: fullName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        role: 'user',
        createdAt: new Date()
      });

      alert('Registrasi berhasil! Anda akan diarahkan ke dashboard.');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar');
      } else if (error.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Minimal 6 karakter.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Format email tidak valid');
      } else {
        setError('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
      }
    }
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

      {/* Right side - Register Form (40%) */}
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
              Daftar Akun Baru
            </Typography>
          </Box>

          <form onSubmit={handleRegister} className="space-y-4">
            <TextField
              fullWidth
              label="Nama Lengkap"
              variant="outlined"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <EmailIcon className="text-gray-400 mr-2" />
                ),
                sx: {
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }
              }}
              required
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
                    onClick={() => setShowPassword(!showPassword)}
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
              required
            />

            <TextField
              fullWidth
              label="Konfirmasi Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LockOutlinedIcon className="text-gray-400 mr-2" />
                ),
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="large"
                    className="text-gray-400"
                  >
                    {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                ),
                sx: {
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }
              }}
              required
            />

            {error && (
              <Typography color="error" className="text-center text-sm">
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
              Daftar
            </Button>

            <Box className="text-center mt-4">
              <Typography variant="body2" className="text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 font-semibold no-underline hover:underline"
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
} 