'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import ReportForm from './components/ReportForm';
import ReportDetail from './components/ReportDetail';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

interface Report {
  id: string;
  nama: string;
  nomorIdentitas: string;
  tanggalLaporan: any;
  lokasiKehilangan: string;
  status: 'Pending' | 'Diproses' | 'Selesai';
  items: any[];
  userId: string;
}

export default function ReportsPage() {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailOpen(true);
  };

  const handleDeleteClick = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReport) return;
    
    try {
      await deleteDoc(doc(db, 'reports', selectedReport.id));
      setDeleteDialogOpen(false);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Diproses':
        return 'info';
      case 'Selesai':
        return 'success';
      default:
        return 'default';
    }
  };

  const fetchReports = async () => {
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedReports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const reportsQuery = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('tanggalLaporan', 'desc')
    );

    const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
      const reportData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportData);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your reports</p>
      </div>
    );
  }

  return (
    <Box className="p-6">
      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5" className="font-bold">
          Laporan Kehilangan
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          className="bg-blue-600"
        >
          Tambah Laporan
        </Button>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper} className="mb-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No. Laporan</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Nama Pelapor</TableCell>
              <TableCell>No. Identitas</TableCell>
              <TableCell>Lokasi Kehilangan</TableCell>
              <TableCell>Barang</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Belum ada laporan
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    {dayjs(report.tanggalLaporan.toDate()).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>{report.nama}</TableCell>
                  <TableCell>{report.nomorIdentitas}</TableCell>
                  <TableCell>{report.lokasiKehilangan}</TableCell>
                  <TableCell>
                    {report.items?.length > 0 ? (
                      <Chip 
                        label={`${report.items.length} barang`}
                        size="small"
                        className="bg-gray-100"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={getStatusColor(report.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box className="flex justify-center gap-1">
                      {report.status !== 'Pending' && (
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(report)}
                          title="Lihat Detail"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(report)}
                        className="text-red-600 hover:text-red-700"
                        title="Hapus Laporan"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        className="flex items-center justify-center"
      >
        <Paper className="w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <Typography id="modal-title" variant="h6" className="mb-4 font-bold">
            Form Laporan Kehilangan
          </Typography>
          <ReportForm onClose={handleClose} onSuccess={fetchReports} />
        </Paper>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        aria-labelledby="detail-modal-title"
        className="flex items-center justify-center"
      >
        <Paper className="w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <ReportDetail
              report={selectedReport}
              onClose={() => setDetailOpen(false)}
              onDelete={fetchReports}
            />
          )}
        </Paper>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            className="text-red-600 hover:text-red-700"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}