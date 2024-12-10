'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dayjs } from 'dayjs';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { getAuth } from 'firebase/auth';
import LostItemForm from './LostItemForm';
import {
  JENIS_IDENTITAS,
  AGAMA,
  JENIS_KELAMIN,
  KEWARGANEGARAAN,
  PEKERJAAN,
  KATEGORI_TKP,
  KANTOR_TUJUAN,
} from './formConstants';

dayjs.locale('id');

interface FormData {
  tanggalLaporan: Dayjs | null;
  jenisIdentitas: string;
  nomorIdentitas: string;
  nama: string;
  tanggalLahir: Dayjs | null;
  tempatLahir: string;
  noTelp: string;
  agama: string;
  jenisKelamin: string;
  kewarganegaraan: string;
  pekerjaan: string;
  alamat: string;
  waktuKehilangan: Dayjs | null;
  kategoriTKP: string;
  tkpKota: string;
  tkpKecamatan: string;
  tkpDesa: string;
  lokasiKehilangan: string;
  uraianKehilangan: string;
  kerugian: string;
  kantorTujuan: string;
}

interface LostItem {
  kode: string;
  kelompok: string;
  jenis: string;
  bentuk: string;
  satuan: string;
  jumlah: number;
  keterangan: string;
}

interface ReportFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Location {
  id: string;
  name: string;
}

interface Attachment {
  name: string;
  data: string; // Base64 string
  type: string;
}

const INITIAL_FORM_DATA: FormData = {
  tanggalLaporan: null,
  jenisIdentitas: '',
  nomorIdentitas: '',
  nama: '',
  tanggalLahir: null,
  tempatLahir: '',
  noTelp: '',
  agama: '',
  jenisKelamin: '',
  kewarganegaraan: '',
  pekerjaan: '',
  alamat: '',
  waktuKehilangan: null,
  kategoriTKP: '',
  tkpKota: '',
  tkpKecamatan: '',
  tkpDesa: '',
  lokasiKehilangan: '',
  uraianKehilangan: '',
  kerugian: '',
  kantorTujuan: '',
};

const INITIAL_ITEM: LostItem = {
  kode: '',
  kelompok: '',
  jenis: '',
  bentuk: '',
  satuan: '',
  jumlah: 1,
  keterangan: '',
};

export default function ReportForm({ onClose, onSuccess }: ReportFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [currentItem, setCurrentItem] = useState<LostItem>(INITIAL_ITEM);
  const [cities, setCities] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [villages, setVillages] = useState<Location[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setLostItems(prev => [...prev, currentItem]);
    setCurrentItem(INITIAL_ITEM);
  };

  const handleRemoveItem = (index: number) => {
    setLostItems(prev => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (1MB limit due to Firestore limitations)
        if (file.size > 1 * 1024 * 1024) {
          alert(`File ${file.name} terlalu besar. Maksimal ukuran file adalah 1MB`);
          continue;
        }

        // Check file type
        if (!file.type.match('image.*') && file.type !== 'application/pdf') {
          alert(`File ${file.name} harus berupa gambar atau PDF`);
          continue;
        }

        const base64 = await convertToBase64(file);
        
        setAttachments(prev => [...prev, {
          name: file.name,
          data: base64,
          type: file.type
        }]);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Gagal memproses file');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        alert('You must be logged in to submit a report');
        return;
      }

      // Convert Dayjs objects to Timestamps
      const now = new Date();
      const reportData = {
        ...formData,
        userId: user.uid, // Add user ID
        createdAt: Timestamp.fromDate(now), // Add creation timestamp
        tanggalLaporan: Timestamp.fromDate(now),
        tanggalLahir: formData.tanggalLahir ? Timestamp.fromDate(formData.tanggalLahir.toDate()) : null,
        waktuKehilangan: formData.waktuKehilangan ? Timestamp.fromDate(formData.waktuKehilangan.toDate()) : null,
        status: 'Pending', // Set initial status
        items: lostItems.map(item => ({
          ...item,
          jumlah: Number(item.jumlah)
        })),
        attachments: attachments.map(attachment => ({
          name: attachment.name,
          data: attachment.data,
          type: attachment.type
        }))
      };

      // Remove undefined values
      Object.keys(reportData as { [key: string]: any }).forEach(key => {
        if ((reportData as any)[key] === undefined) {
          delete (reportData as any)[key];
        }
      });

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'reports'), reportData);
      console.log('Document written with ID:', docRef.id);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Gagal menyimpan laporan. Silakan coba lagi.');
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/regencies/13.json');
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchDistricts = async (cityId: string) => {
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchVillages = async (districtId: string) => {
    try {
      const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
      const data = await response.json();
      setVillages(data);
    } catch (error) {
      console.error('Error fetching villages:', error);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    handleFormChange('tkpKota', cities.find(city => city.id === cityId)?.name || '');
    setSelectedDistrict('');
    handleFormChange('tkpKecamatan', '');
    handleFormChange('tkpDesa', '');
    setDistricts([]);
    setVillages([]);
    if (cityId) {
      fetchDistricts(cityId);
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    handleFormChange('tkpKecamatan', districts.find(district => district.id === districtId)?.name || '');
    handleFormChange('tkpDesa', '');
    setVillages([]);
    if (districtId) {
      fetchVillages(districtId);
    }
  };

  const handlePreviewClick = (attachmentData: string) => {
    setPreviewUrl(attachmentData);
    setShowPreview(true);
  };

  const renderAttachmentSecondary = (attachment: Attachment) => (
    <span>
      <span className="block text-sm text-gray-600">
        {attachment.type.includes('image') ? 'Gambar' : 'PDF'}
      </span>
      {attachment.type.includes('image') && (
        <Button
          size="small"
          onClick={() => handlePreviewClick(attachment.data)}
          className="mt-1"
        >
          Lihat Preview
        </Button>
      )}
    </span>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit}>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Jenis Identitas"
                value={formData.jenisIdentitas}
                onChange={(e) => handleFormChange('jenisIdentitas', e.target.value)}
              >
                {JENIS_IDENTITAS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nomor Identitas"
                value={formData.nomorIdentitas}
                onChange={(e) => handleFormChange('nomorIdentitas', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nama"
                value={formData.nama}
                onChange={(e) => handleFormChange('nama', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Tanggal Lahir"
                value={formData.tanggalLahir}
                onChange={(date) => handleFormChange('tanggalLahir', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tempat Lahir"
                value={formData.tempatLahir}
                onChange={(e) => handleFormChange('tempatLahir', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="No. Telepon"
                value={formData.noTelp}
                onChange={(e) => handleFormChange('noTelp', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Agama"
                value={formData.agama}
                onChange={(e) => handleFormChange('agama', e.target.value)}
              >
                {AGAMA.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Jenis Kelamin"
                value={formData.jenisKelamin}
                onChange={(e) => handleFormChange('jenisKelamin', e.target.value)}
              >
                {JENIS_KELAMIN.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kewarganegaraan"
                value={formData.kewarganegaraan}
                onChange={(e) => handleFormChange('kewarganegaraan', e.target.value)}
              >
                {KEWARGANEGARAAN.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Pekerjaan"
                value={formData.pekerjaan}
                onChange={(e) => handleFormChange('pekerjaan', e.target.value)}
              >
                {PEKERJAAN.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Alamat"
                value={formData.alamat}
                onChange={(e) => handleFormChange('alamat', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Waktu Kehilangan"
                value={formData.waktuKehilangan}
                onChange={(date) => handleFormChange('waktuKehilangan', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kategori TKP"
                value={formData.kategoriTKP}
                onChange={(e) => handleFormChange('kategoriTKP', e.target.value)}
              >
                {KATEGORI_TKP.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kota/Kabupaten"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kecamatan"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedCity}
              >
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id}>
                    {district.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Desa/Kelurahan"
                value={formData.tkpDesa}
                onChange={(e) => handleFormChange('tkpDesa', e.target.value)}
                disabled={!selectedDistrict}
              >
                {villages.map((village) => (
                  <MenuItem key={village.id} value={village.name}>
                    {village.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Lokasi Kehilangan"
                value={formData.lokasiKehilangan}
                onChange={(e) => handleFormChange('lokasiKehilangan', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Uraian Kehilangan"
                value={formData.uraianKehilangan}
                onChange={(e) => handleFormChange('uraianKehilangan', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Kerugian (Rp)"
                value={formData.kerugian}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || Number(value) >= 0) {
                    handleFormChange('kerugian', value);
                  }
                }}
                InputProps={{
                  startAdornment: 'Rp',
                  inputProps: { min: 0 },
                }}
                helperText="Masukkan estimasi nilai kerugian dalam Rupiah"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Kantor Tujuan"
                value={formData.kantorTujuan}
                onChange={(e) => handleFormChange('kantorTujuan', e.target.value)}
              >
                {KANTOR_TUJUAN.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Lost Items Section */}
        <LostItemForm
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          lostItems={lostItems}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />

        {/* Attachments Section */}
        <Divider />
        <Box>
          <Typography variant="subtitle1" component="div" className="font-semibold mb-3">
            Lampiran
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box component="div" className="mb-2">
                <Typography component="div" variant="body2" color="textSecondary" className="flex items-center gap-1">
                  <InfoIcon fontSize="small" className="text-blue-500" />
                  <span>Maksimal ukuran file: 1MB. Format yang didukung: Gambar (JPG, PNG) dan PDF</span>
                </Typography>
              </Box>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Tambah Lampiran
              </Button>
            </Grid>

            {/* Attachments List */}
            <Grid item xs={12}>
              <List>
                {attachments.map((attachment, index) => (
                  <ListItem 
                    key={index} 
                    className="border rounded-lg mb-2 bg-gray-50"
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    {attachment.type.includes('image') ? (
                      <ImageIcon className="mr-2 text-blue-500" />
                    ) : (
                      <PictureAsPdfIcon className="mr-2 text-red-500" />
                    )}
                    <ListItemText
                      primary={<span>{attachment.name}</span>}
                      secondary={renderAttachmentSecondary(attachment)}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Box>

        {/* Image Preview Dialog */}
        <Dialog
          open={showPreview}
          onClose={() => setShowPreview(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle component="div" className="flex justify-between items-center">
            <span>Preview</span>
            <IconButton onClick={() => setShowPreview(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {previewUrl && (
              <Box component="div" className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Submit Buttons */}
        <Box component="div" className="flex justify-end gap-2">
          <Button variant="outlined" onClick={onClose}>
            Batal
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            className="bg-blue-600"
          >
            Simpan
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
} 