'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { TextField, Button, Typography, Box, Paper, Alert } from '@mui/material';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        type: 'success',
        text: 'Password reset email sent! Please check your inbox.'
      });
      setEmail('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Box className="max-w-md w-full space-y-8">
        <Paper elevation={2} className="p-8">
          <div className="text-center mb-8">
            <Typography variant="h5" component="h1" className="font-bold mb-2">
              Reset Password
            </Typography>
            <Typography color="textSecondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </div>

          {message.text && (
            <Alert severity={message.type as 'error' | 'success'} className="mb-4">
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: <EmailIcon className="mr-2 text-gray-400" />,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              className="mt-4"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center mt-4">
              <Link 
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </Paper>
      </Box>
    </Box>
  );
} 