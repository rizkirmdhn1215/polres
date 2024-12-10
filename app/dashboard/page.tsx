'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { getAuth } from 'firebase/auth';

dayjs.locale('id');

interface Report {
  id: string;
  nama: string;
  tanggalLaporan: any;
  status: string;
  items: any[];
}

interface StatusCount {
  pending: number;
  diproses: number;
  selesai: number;
}

interface Notification {
  id: string;
  reportId: string;
  nama: string;
  message: string;
  timestamp: any;
  type: 'status_update' | 'admin_message' | 'system';
  read: boolean;
  status: 'selesai' | 'diproses' | 'ditolak';
}

export default function DashboardPage() {
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [statusCount, setStatusCount] = useState<StatusCount>({
    pending: 0,
    diproses: 0,
    selesai: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchLatestReport = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
      }

      const q = query(
        collection(db, 'reports'),
        where('userId', '==', user.uid),
        orderBy('tanggalLaporan', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setLatestReport({ id: doc.id, ...doc.data() } as Report);
      }
    } catch (error) {
      alert('Gagal memuat laporan terbaru. Silakan refresh halaman.');
    }
  };

  const fetchStatusCount = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
      }

      const counts = { pending: 0, diproses: 0, selesai: 0 };
      const statuses = ['pending', 'diproses', 'selesai'];
      
      for (const status of statuses) {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid),
          where('status', '==', status)
        );
        const snapshot = await getDocs(q);
        counts[status as keyof StatusCount] = snapshot.size;
      }
      
      setStatusCount(counts);
    } catch (error) {
      alert('Gagal memuat status laporan. Silakan refresh halaman.');
    }
  };

  const fetchNotifications = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const notificationsList: Notification[] = [];
      snapshot.forEach((doc) => {
        notificationsList.push({ 
          id: doc.id,
          ...doc.data()
        } as Notification);
      });
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchLatestReport();
    fetchStatusCount();
    fetchNotifications();
  }, []);

  return (
    <Box className="p-6">
      <Typography variant="h5" className="mb-6 font-bold">
        Dashboard
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Report Card */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold">
            Laporan Terakhir
          </Typography>
          {latestReport ? (
            <Box>
              <Box className="flex justify-between items-start mb-3">
                <Typography variant="body2" className="font-medium">
                  {latestReport.nama}
                </Typography>
                <Chip
                  label={latestReport.status.charAt(0).toUpperCase() + latestReport.status.slice(1)}
                  size="small"
                  color={
                    latestReport.status === 'selesai'
                      ? 'success'
                      : latestReport.status === 'diproses'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {dayjs(latestReport.tanggalLaporan.toDate()).format('DD MMMM YYYY')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {latestReport.items?.length || 0} barang dilaporkan
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Belum ada laporan
            </Typography>
          )}
        </Paper>

        {/* Status Report Card */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold">
            Status Laporan
          </Typography>
          <Box className="space-y-3">
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Pending</Typography>
              <Chip
                label={statusCount.pending}
                size="small"
                className="bg-gray-100"
              />
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Diproses</Typography>
              <Chip
                label={statusCount.diproses}
                size="small"
                color="warning"
              />
            </Box>
            <Box className="flex justify-between items-center">
              <Typography variant="body2">Selesai</Typography>
              <Chip
                label={statusCount.selesai}
                size="small"
                color="success"
              />
            </Box>
          </Box>
        </Paper>

        {/* Notifications Card */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4 font-semibold">
            Notifikasi
          </Typography>
          <Box className="space-y-3 overflow-y-auto" sx={{ maxHeight: '300px' }}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Box 
                  key={notification.id} 
                  className={`p-3 rounded-lg ${
                    notification.read 
                      ? 'bg-gray-50 hover:bg-gray-100' 
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <Typography variant="body2" className="mb-1">
                    Laporan anda dengan ID "{notification.reportId}" dan atas nama "{notification.nama}" telah {
                      notification.status === 'selesai' 
                        ? 'selesai diproses' 
                        : notification.status === 'ditolak'
                        ? 'ditolak'
                        : 'sedang diproses'
                    }
                  </Typography>
                  {notification.message && (
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      className="mt-1 bg-white p-2 rounded"
                    >
                      Catatan Admin: {notification.message}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    className="block mt-2"
                  >
                    {dayjs(notification.timestamp.toDate()).format('DD MMMM YYYY, HH:mm')}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Tidak ada notifikasi baru
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 