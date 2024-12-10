'use client';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

dayjs.locale('id');

interface ReportDetailDialogProps {
  report: any;
  open: boolean;
  onClose: () => void;
  onReview: () => void;
  showDownloadButton?: boolean;
  onDownloadPDF?: (report: any) => void;
}

export default function ReportDetailDialog({ 
  report, 
  open, 
  onClose,
  onReview,
  showDownloadButton,
  onDownloadPDF
}: ReportDetailDialogProps) {
  if (!report) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h6">Detail Laporan</Typography>
          {showDownloadButton && onDownloadPDF && (
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => onDownloadPDF(report)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Download PDF
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-6">
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Informasi Dasar
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  ID Laporan
                </Typography>
                <Typography variant="body1">
                  {report.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Tanggal Laporan
                </Typography>
                <Typography variant="body1">
                  {dayjs(report.tanggalLaporan?.toDate()).format('DD MMMM YYYY, HH:mm')}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Personal Information */}
          <Box>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Informasi Pelapor
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Nama
                </Typography>
                <Typography variant="body1">
                  {report.nama}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  NIK
                </Typography>
                <Typography variant="body1">
                  {report.nomorIdentitas}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Tempat/Tanggal Lahir
                </Typography>
                <Typography variant="body1">
                  {report.tempatLahir}, {dayjs(report.tanggalLahir?.toDate()).format('DD MMMM YYYY')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Jenis Kelamin
                </Typography>
                <Typography variant="body1">
                  {report.jenisKelamin}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Agama
                </Typography>
                <Typography variant="body1">
                  {report.agama}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Pekerjaan
                </Typography>
                <Typography variant="body1">
                  {report.pekerjaan}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Alamat
                </Typography>
                <Typography variant="body1">
                  {report.alamat}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Lost Items */}
          <Box>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Barang yang Hilang
            </Typography>
            <List>
              {report.items?.map((item: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${item.jumlah} ${item.satuan} ${item.bentuk} ${item.jenis}`}
                    secondary={item.keterangan}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Loss Information */}
          <Box>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Informasi Kehilangan
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Waktu Kehilangan
                </Typography>
                <Typography variant="body1">
                  {dayjs(report.waktuKehilangan?.toDate()).format('DD MMMM YYYY')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Lokasi Kehilangan
                </Typography>
                <Typography variant="body1">
                  {report.lokasiKehilangan}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <Box>
              <Typography variant="subtitle1" className="font-bold mb-2">
                Lampiran
              </Typography>
              <List>
                {report.attachments.map((attachment: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {attachment.type.includes('image') ? (
                        <ImageIcon />
                      ) : (
                        <PictureAsPdfIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText>
                      {attachment.type.includes('image') ? (
                        <img 
                          src={attachment.data} 
                          alt={attachment.name}
                          style={{ maxWidth: '200px', cursor: 'pointer' }}
                          onClick={() => window.open(attachment.data, '_blank')}
                        />
                      ) : (
                        <a 
                          href={attachment.data} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.name}
                        </a>
                      )}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Tutup</Button>
        {report.status !== 'selesai' && report.status !== 'ditolak' && (
          <Button 
            onClick={onReview}
            variant="contained"
          >
            Review Laporan
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 