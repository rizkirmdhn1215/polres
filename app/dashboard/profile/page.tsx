'use client';
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

interface UserProfile {
  displayName: string;
  phoneNumber: string;
  address: string;
  nik: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    address: '',  // You'll need to fetch this from Firestore
    nik: ''       // You'll need to fetch this from Firestore
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('No user logged in');

      // Update auth profile
      await updateProfile(user, {
        displayName: profile.displayName,
      });

      // Update additional info in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        nik: profile.nik,
        updatedAt: new Date()
      });

      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Typography variant="h5" className="mb-6 font-bold">
        Profile
      </Typography>

      <Paper elevation={2} className="p-6">
        <Box className="flex flex-col items-center gap-4 mb-6">
          <Avatar
            src={user?.photoURL || undefined}
            alt={user?.displayName || 'User'}
            sx={{ width: 120, height: 120 }}
          />
          <Typography variant="h6" className="font-bold">
            {user?.displayName || 'User'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.email}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Profile
          </Button>
        </Box>

        <Box className="mt-6">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Phone Number
              </Typography>
              <Typography variant="body1">
                {profile.phoneNumber || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                NIK
              </Typography>
              <Typography variant="body1">
                {profile.nik || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Address
              </Typography>
              <Typography variant="body1">
                {profile.address || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Full Name"
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="NIK"
              name="nik"
              value={profile.nik}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={profile.address}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 