'use client';
import { useRef, useState } from 'react';
import generatePDF from 'react-to-pdf';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import ImageIcon from '@mui/icons-material/Image';

dayjs.locale('id');

interface ReportDetailProps {
  report: any;
  onClose: () => void;
  onDelete?: () => void;
}

export default function ReportDetail({ report, onClose, onDelete }: ReportDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, 'reports', report.id));
      setDeleteDialogOpen(false);
      if (onDelete) onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting report:', error);
      // You might want to show an error message to the user
    }
  };

  const handleDownloadPDF = () => {
    const options = {
      filename: `SKTLK_${report.id}.pdf`,
      page: {
        margin: 20,
        format: 'a4',
      },
    };
    
    generatePDF(targetRef, options);
  };

  return (
    <Box className="space-y-6">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6" className="font-bold">
          Detail Laporan
        </Typography>
        <Box className="space-x-2">
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Export PDF
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Tutup
          </Button>
        </Box>
      </Box>

      <div ref={targetRef} className="px-4 pt-1 pb-8">
        {/* First Page Content */}
        <div className="page">
          {/* Header with Logo */}
          <Box className="mb-8 mt-0">
            {/* Left-positioned but center-styled text */}
            <Box className="w-[600px] mb-3 ml-2 mt-0">
              <Typography variant="h6" className="font-bold text-sm text-center whitespace-nowrap mt-0">
                KEPOLISIAN NEGARA REPUBLIK INDONESIA
              </Typography>
              <Typography variant="h6" className="font-bold text-sm text-center">
                DAERAH SUMATERA BARAT
              </Typography>
              <Typography variant="h6" className="font-bold text-sm text-center">
                RESOR PAYAKUMBUH
              </Typography>
              <Typography variant="body2" className="underline text-sm text-center">
                Jalan Pahlawan Nomor 33 Payakumbuh 26232
              </Typography>
            </Box>
            
            {/* Centered Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo.png"
                alt="Police Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            
            {/* Centered title */}
            <Box className="text-center">
              <Typography variant="subtitle1" className="font-bold underline">
                SURAT KETERANGAN TANDA LAPORAN KEHILANGAN
              </Typography>
              <Typography variant="body2" className="mt-1">
                NOMOR : SKTLK/{report.id}/XII/2024/SPKT/POLRES PAYAKUMBUH/POLDA SUMATERA BARAT
              </Typography>
            </Box>
          </Box>

          {/* Opening Statement */}
          <Box className="mb-4">
            <Typography variant="body1" className="text-justify">
              Yang bertanda tangan dibawah ini menerangkan benar pada hari {dayjs(report.tanggalLaporan?.toDate()).format('dddd')} tanggal {dayjs(report.tanggalLaporan?.toDate()).format('DD MMMM YYYY')}, sekira Pukul {dayjs(report.tanggalLaporan?.toDate()).format('HH.mm')} WIB, telah datang ke SPKT seorang {report.jenisKelamin} berkebangasaan {report.kewarganegaraan} mengaku:
            </Typography>
          </Box>

          {/* Personal Information */}
          <Box className="mb-6 ml-4">
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>1. NAMA</Typography>
              <Typography variant="body1">: {report.nama}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>2. NIK</Typography>
              <Typography variant="body1">: {report.nomorIdentitas}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>3. TEMPAT/TGL. LAHIR</Typography>
              <Typography variant="body1">: {report.tempatLahir}/{dayjs(report.tanggalLahir?.toDate()).format('DD-MM-YYYY')}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>4. AGAMA</Typography>
              <Typography variant="body1">: {report.agama}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>5. KEWARGANEGARAAN</Typography>
              <Typography variant="body1">: {report.kewarganegaraan}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>6. PEKERJAAN</Typography>
              <Typography variant="body1">: {report.pekerjaan}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>7. ALAMAT</Typography>
              <Typography variant="body1">: {report.alamat}</Typography>
            </Box>
            <Box className="flex mb-2">
              <Typography variant="body1" style={{ width: '200px' }}>8. TELP/FAX/E-MAIL/WA</Typography>
              <Typography variant="body1">: {report.noTelp || '-'}</Typography>
            </Box>
          </Box>

          {/* Lost Items Description */}
          <Box className="mb-6">
            <Typography variant="body1" className="mb-2">
              Telah melaporkan tentang kehilangan barang / surat berharga berupa:
            </Typography>
            <Box className="ml-4">
              {report.items?.map((item: any, index: number) => (
                <Typography key={index} variant="body1" className="mb-1">
                  {index + 1}. {item.jumlah} ({item.satuan}) {item.bentuk} {item.jenis}, {item.keterangan}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Additional Information */}
          <Box className="mb-6">
            <Typography variant="body1" className="text-justify">
              Diketahui hilang pada {dayjs(report.waktuKehilangan?.toDate()).format('dddd, DD MMMM YYYY')} di {report.lokasiKehilangan}, pelapor sudah berusaha mencari namun tidak di temukan, kemudian pelapor melaporkan kehilangan tersebut ke SPKT Polres Payakumbuh.
            </Typography>
          </Box>

          {/* Disclaimer */}
          <Box className="mb-6">
            <Typography variant="body1" className="font-bold">KETERANGAN:</Typography>
            <ul className="list-disc ml-6">
              <li className="text-justify">SKTLK (Surat Keterangan Tanda Laporan Kehilangan) ini bukan sebagai pengganti Surat/Dokumen yang hilang melainkan sebagai surat untuk mengurus surat-surat yang baru ke instansi yang berwenang.</li>
              <li className="text-justify">SKTLK (Surat Keterangan Tanda Laporan Kehilangan) ini berlaku 14 (Empat Belas) hari sejak tanggal dikeluarkan.</li>
              <li className="text-justify">SKTLK (Surat Keterangan Tanda Laporan Kehilangan) tidak berlaku apabila laporan/keterangan palsu, sebagaimana di maksud dalam 242 ayat (1) KUHP (Barang Siapa memberikan, membuat laporan atau keterangan palsu atau bohong di ancam penjara paling lama tujuh tahun).</li>
            </ul>
          </Box>

          {/* Closing and Signature Section */}
          <Box className="mt-8">
            <Typography variant="body1" className="mb-6 text-center">
              Demikianlah Surat Tanda Penerimaan Laporan ini dibuat untuk dapat dipergunakan seperlunya.
            </Typography>
            <Box className="flex justify-between mt-4">
              <Box className="text-center">
                <Typography variant="body1">Pelapor</Typography>
                <Box className="mt-20">
                  <Typography variant="body1" className="font-bold underline">
                    {report.nama}
                  </Typography>
                </Box>
              </Box>
              <Box className="text-center">
                <Typography variant="body1">
                  Payakumbuh, {dayjs().format('DD MMMM YYYY')}
                </Typography>
                <Typography variant="body1">
                  a.n KEPALA KEPOLISIAN RESOR PAYAKUMBUH
                </Typography>
                <Typography variant="body1">
                  BANIT SPKT
                </Typography>
                <Box className="mt-16">
                  <Typography variant="body1" className="font-bold underline">
                    HASNIL QALBI
                  </Typography>
                  <Typography variant="body1">
                    BRIGADIR POLISI DUA NRP 03100376
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </div>

        {/* Second Page - Attachments */}
        {report.attachments && report.attachments.length > 0 && (
          <div className="page break-before-page">
            <Box className="mb-6">
              <Typography variant="h6" className="font-bold mb-4">
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
                        <Link 
                          href={attachment.data}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.name}
                        </Link>
                      )}
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Box>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
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