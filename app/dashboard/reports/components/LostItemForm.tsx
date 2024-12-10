import { Box, Typography, Grid, TextField, Button, MenuItem } from '@mui/material';
import { 
  KODE_BARANG, 
  KELOMPOK_BARANG, 
  JENIS_BARANG, 
  BENTUK_BARANG, 
  SATUAN 
} from './formConstants';

interface LostItemFormProps {
  currentItem: LostItem;
  setCurrentItem: React.Dispatch<React.SetStateAction<LostItem>>;
  lostItems: LostItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
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

export default function LostItemForm({
  currentItem,
  setCurrentItem,
  lostItems,
  onAddItem,
  onRemoveItem,
}: LostItemFormProps) {
  const getJenisOptions = () => {
    if (!currentItem.kelompok) return [];
    return JENIS_BARANG[currentItem.kelompok as keyof typeof JENIS_BARANG] || [];
  };

  const getBentukOptions = () => {
    if (!currentItem.kelompok) return [];
    return BENTUK_BARANG[currentItem.kelompok as keyof typeof BENTUK_BARANG] || [];
  };

  return (
    <Box>
      <Typography variant="subtitle1" className="font-semibold mb-3">
        Barang yang Hilang
      </Typography>
      <Grid container spacing={2} className="mb-4">
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Kode"
            value={currentItem.kode || ''}
            onChange={(e) => setCurrentItem({...currentItem, kode: e.target.value})}
          >
            {KODE_BARANG?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )) || <MenuItem value="">No options</MenuItem>}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Kelompok"
            value={currentItem.kelompok || ''}
            onChange={(e) => setCurrentItem({
              ...currentItem,
              kelompok: e.target.value,
              jenis: '',
              bentuk: ''
            })}
          >
            {KELOMPOK_BARANG?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )) || <MenuItem value="">No options</MenuItem>}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Jenis"
            value={currentItem.jenis || ''}
            onChange={(e) => setCurrentItem({...currentItem, jenis: e.target.value})}
            disabled={!currentItem.kelompok}
          >
            {getJenisOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )) || <MenuItem value="">Select Kelompok first</MenuItem>}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Bentuk"
            value={currentItem.bentuk || ''}
            onChange={(e) => setCurrentItem({...currentItem, bentuk: e.target.value})}
            disabled={!currentItem.kelompok}
          >
            {getBentukOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )) || <MenuItem value="">Select Kelompok first</MenuItem>}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Satuan"
            value={currentItem.satuan || ''}
            onChange={(e) => setCurrentItem({...currentItem, satuan: e.target.value})}
          >
            {SATUAN?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            )) || <MenuItem value="">No options</MenuItem>}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Jumlah"
            value={currentItem.jumlah}
            onChange={(e) => setCurrentItem({...currentItem, jumlah: Number(e.target.value)})}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Keterangan"
            value={currentItem.keterangan}
            onChange={(e) => setCurrentItem({...currentItem, keterangan: e.target.value})}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={onAddItem}
            className="mt-2"
          >
            Tambah Barang
          </Button>
        </Grid>
      </Grid>

      {/* List of added items */}
      {lostItems.length > 0 && (
        <Box className="mt-4">
          <Typography variant="subtitle2" className="mb-2">
            Daftar Barang yang Hilang
          </Typography>
          {lostItems.map((item, index) => (
            <Box key={index} className="flex justify-between items-center p-2 bg-gray-50 mb-2 rounded">
              <Typography>
                {item.kelompok} - {item.jenis} ({item.jumlah} {item.satuan})
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={() => onRemoveItem(index)}
              >
                Hapus
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
} 