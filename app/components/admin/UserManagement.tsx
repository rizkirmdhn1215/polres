'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/app/firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import generatePDF from 'react-to-pdf';
import ReportDetail from '@/app/dashboard/reports/components/ReportDetail';

dayjs.locale('id');

interface Report {
  id: string;
  nama: string;
  nomorIdentitas: string;
  status: string;
  tanggalLaporan: any;
  items: any[];
  tempatLahir: string;
  tanggalLahir: any;
  jenisKelamin: string;
  agama: string;
  pekerjaan: string;
  alamat: string;
  waktuKehilangan: any;
  lokasiKehilangan: string;
  adminNote?: string;
}

export default function AllReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, orderBy('tanggalLaporan', 'desc'));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      setReports(reportsData);
    } catch (error) {
      alert('Gagal memuat daftar laporan. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedReport(null);
  };

  const getStatusColor = (status: string) => {
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

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSearch = 
      report.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.nomorIdentitas.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleExportAllPDF = () => {
    const options = {
      filename: `Semua_Laporan_Kehilangan_${dayjs().format('DDMMYYYY')}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
    };
    
    generatePDF(tableRef, options);
  };

  const handleExportSinglePDF = async (report: Report) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin-bottom: 10px;">KEPOLISIAN NEGARA REPUBLIK INDONESIA</h2>
          <h3 style="margin-bottom: 20px;">DAERAH SUMATERA BARAT</h3>
          <h3 style="margin-bottom: 20px;">RESOR PAYAKUMBUH</h3>
          <h3 style="margin-bottom: 20px;">SURAT TANDA PENERIMAAN LAPORAN KEHILANGAN</h3>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">Informasi Dasar</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 200px;">ID Laporan</td>
              <td>: ${report.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Tanggal Laporan</td>
              <td>: ${dayjs(report.tanggalLaporan?.toDate()).format('DD MMMM YYYY, HH:mm')}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">Informasi Pelapor</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 200px;">Nama</td>
              <td>: ${report.nama}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">NIK</td>
              <td>: ${report.nomorIdentitas}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Tempat/Tanggal Lahir</td>
              <td>: ${report.tempatLahir}, ${dayjs(report.tanggalLahir?.toDate()).format('DD MMMM YYYY')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Jenis Kelamin</td>
              <td>: ${report.jenisKelamin}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Agama</td>
              <td>: ${report.agama}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Pekerjaan</td>
              <td>: ${report.pekerjaan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Alamat</td>
              <td>: ${report.alamat}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">Barang yang Hilang</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 12px; border: 1px solid #ddd;">No</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Jenis</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Jumlah</th>
                <th style="padding: 12px; border: 1px solid #ddd;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${report.items?.map((item: any, index: number) => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${item.jenis}</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${item.jumlah} ${item.satuan}</td>
                  <td style="padding: 12px; border: 1px solid #ddd;">${item.keterangan || '-'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 12px;">Tidak ada data</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">Informasi Kehilangan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 200px;">Waktu Kehilangan</td>
              <td>: ${dayjs(report.waktuKehilangan?.toDate()).format('DD MMMM YYYY')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Lokasi Kehilangan</td>
              <td>: ${report.lokasiKehilangan || '-'}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px;">Status Laporan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 200px;">Status</td>
              <td>: ${report.status.toUpperCase()}</td>
            </tr>
            ${report.adminNote ? `
            <tr>
              <td style="padding: 8px 0;">Catatan Admin</td>
              <td>: ${report.adminNote}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-top: 40px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 60%;"></td>
              <td style="text-align: center;">
                <p>Payakumbuh, ${dayjs().format('DD MMMM YYYY')}</p>
                <p style="margin-top: 80px;">(_______________________)</p>
                <p>Petugas yang Menangani</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(tempDiv);

    try {
      const options = {
        filename: `Laporan_${report.id}_${dayjs().format('DDMMYYYY')}.pdf`,
        page: {
          margin: 20,
          format: 'a4',
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
      };

      await generatePDF(() => tempDiv, options);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box className="space-y-4">
      {/* Header and Controls */}
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="font-bold">
          Semua Laporan Kehilangan
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportAllPDF}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Export Semua PDF
        </Button>
      </Box>

      {/* Filters */}
      <Box className="flex gap-4 mb-4">
        <FormControl size="small" className="min-w-[200px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="diproses">Diproses</MenuItem>
            <MenuItem value="selesai">Selesai</MenuItem>
            <MenuItem value="ditolak">Ditolak</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Cari berdasarkan nama/ID/NIK..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <div ref={tableRef} className="bg-white p-4 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Laporan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NIK
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <tr 
                key={report.id}
                onClick={() => handleRowClick(report)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {report.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {dayjs(report.tanggalLaporan?.toDate()).format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {report.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {report.nomorIdentitas}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {report.items?.length || 0} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Chip
                    label={report.status}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detail Laporan</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <ReportDetail 
              report={selectedReport} 
              onClose={handleCloseDetailDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 