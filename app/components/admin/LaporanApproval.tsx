'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip
} from '@mui/material';
import ReportDetailDialog from './ReportDetailDialog';

interface Report {
  id: string;
  userId: string;
  content: string;
  status: string;
  userName?: string;
  nama: string;
  items: any[];
  tanggalLaporan: any;
}

export default function LaporanApproval() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchUserName = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().name || userDoc.data().email || 'Pengguna tidak dikenal';
      }
      return 'Pengguna tidak dikenal';
    } catch (error) {
      return 'Pengguna tidak dikenal';
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const reportsRef = collection(db, 'reports');
      const querySnapshot = await getDocs(query(reportsRef));
      
      // Fetch all reports and their corresponding user names
      const reportsPromises = querySnapshot.docs.map(async (doc) => {
        const reportData = doc.data();
        const userName = await fetchUserName(reportData.userId);
        return {
          id: doc.id,
          ...reportData,
          userName
        } as Report;
      });

      const reportsData = await Promise.all(reportsPromises);
      setReports(reportsData);
    } catch (error) {
      alert('Gagal memuat daftar laporan. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReviewClick = (report: Report, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedReport(report);
    setReviewDialogOpen(true);
    setDetailDialogOpen(false);
  };

  const handleCloseReview = () => {
    setReviewDialogOpen(false);
    setSelectedReport(null);
    setStatusUpdate('');
    setAdminNote('');
  };

  const updateReportStatus = async () => {
    if (!selectedReport || !statusUpdate) return;

    try {
      // Update report status
      await updateDoc(doc(db, 'reports', selectedReport.id), {
        status: statusUpdate,
        adminNote: adminNote,
        reviewedAt: new Date()
      });

      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: selectedReport.userId,
        reportId: selectedReport.id,
        nama: selectedReport.nama,
        type: 'status_update',
        status: statusUpdate,
        message: adminNote,
        timestamp: new Date(),
        read: false
      });

      await fetchReports();
      handleCloseReview();
      alert('Status laporan berhasil diperbarui');
    } catch (error) {
      alert('Gagal memperbarui status laporan. Silakan coba lagi.');
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'success';
      case 'diproses':
        return 'warning';
      case 'ditolak':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
    setReviewDialogOpen(false);
  };

  const handleReviewFromDetail = () => {
    setDetailDialogOpen(false);
    setTimeout(() => {
      setReviewDialogOpen(true);
    }, 100);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Report Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr 
              key={report.id} 
              onClick={() => handleViewDetail(report)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{report.userName}</div>
                <div className="text-sm text-gray-500">{report.userId}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  <strong>Name:</strong> {report.nama}<br />
                  <strong>Items:</strong> {report.items?.length || 0} items<br />
                  <strong>Date:</strong> {report.tanggalLaporan?.toDate().toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Chip
                  label={report.status}
                  color={getStatusChipColor(report.status)}
                  size="small"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(report);
                  }}
                  disabled={report.status === 'selesai' || report.status === 'ditolak'}
                >
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail Dialog */}
      <ReportDetailDialog
        report={selectedReport}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onReview={handleReviewFromDetail}
      />

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review Laporan</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box className="space-y-4 mt-2">
              <Typography variant="subtitle2">
                Report ID: {selectedReport.id}
              </Typography>
              <Typography variant="body2">
                Submitted by: {selectedReport.nama}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusUpdate}
                  label="Status"
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <MenuItem value="diproses">Diproses (Hold)</MenuItem>
                  <MenuItem value="selesai">Selesai</MenuItem>
                  <MenuItem value="ditolak">Ditolak</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Admin Note"
                multiline
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this decision..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReview}>Cancel</Button>
          <Button 
            onClick={updateReportStatus}
            variant="contained"
            disabled={!statusUpdate}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 