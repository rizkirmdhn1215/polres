'use client';
import { Box, Typography, Paper } from '@mui/material';

export default function AdminDashboard() {
  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-6">
        Admin Dashboard
      </Typography>

      <Paper elevation={2} className="p-6">
        <Typography variant="h6" className="mb-4">
          Selamat Datang, Admin
        </Typography>
        
        {/* Add your admin-specific content here */}
        <Typography>
          This is the admin dashboard. You can manage users, view reports, etc.
        </Typography>
      </Paper>
    </Box>
  );
}