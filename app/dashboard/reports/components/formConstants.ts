export const JENIS_IDENTITAS = [
  { value: 'ktp', label: 'KTP' },
  { value: 'sim', label: 'SIM' },
  { value: 'paspor', label: 'Paspor' },
  { value: 'kk', label: 'Kartu Keluarga' }
];

export const AGAMA = [
  { value: 'islam', label: 'Islam' },
  { value: 'kristen', label: 'Kristen' },
  { value: 'katolik', label: 'Katolik' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddha', label: 'Buddha' },
  { value: 'konghucu', label: 'Konghucu' },
  { value: 'lainnya', label: 'Lainnya' }
];

export const JENIS_KELAMIN = [
  { value: 'l', label: 'Laki-laki' },
  { value: 'p', label: 'Perempuan' }
];

export const KEWARGANEGARAAN = [
  { value: 'wni', label: 'WNI' },
  { value: 'wna', label: 'WNA' }
];

export const PEKERJAAN = [
  { value: 'pns', label: 'PNS' },
  { value: 'swasta', label: 'Karyawan Swasta' },
  { value: 'wirausaha', label: 'Wirausaha' },
  { value: 'pelajar', label: 'Pelajar/Mahasiswa' },
  { value: 'lainnya', label: 'Lainnya' }
];

export const KATEGORI_TKP = [
  { value: 'jalan', label: 'Jalan Raya' },
  { value: 'rumah', label: 'Rumah' },
  { value: 'kantor', label: 'Kantor' },
  { value: 'mall', label: 'Mall/Pusat Perbelanjaan' },
  { value: 'transportasi', label: 'Transportasi Umum' },
  { value: 'lainnya', label: 'Lainnya' }
];

export const KANTOR_TUJUAN = [
  { value: 'polres', label: 'Polres' },
  { value: 'polsek', label: 'Polsek' },
  { value: 'polda', label: 'Polda' }
];

export const KODE_BARANG = [
  { value: 'DOK', label: 'Dokumen' },
  { value: 'ELK', label: 'Elektronik' },
  { value: 'KND', label: 'Kendaraan' },
  { value: 'PRH', label: 'Perhiasan' },
  { value: 'UNG', label: 'Uang' },
  { value: 'LNN', label: 'Lainnya' }
];

export const KELOMPOK_BARANG = [
  { value: 'dokumen', label: 'Dokumen' },
  { value: 'elektronik', label: 'Elektronik' },
  { value: 'kendaraan', label: 'Kendaraan' },
  { value: 'perhiasan', label: 'Perhiasan' },
  { value: 'uang', label: 'Uang' },
  { value: 'lainnya', label: 'Lainnya' }
];

export const JENIS_BARANG: Record<string, Array<{value: string, label: string}>> = {
  dokumen: [
    { value: 'ktp', label: 'KTP' },
    { value: 'sim', label: 'SIM' },
    { value: 'paspor', label: 'Paspor' }
  ],
  elektronik: [
    { value: 'handphone', label: 'Handphone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' }
  ],
  kendaraan: [
    { value: 'motor', label: 'Sepeda Motor' },
    { value: 'mobil', label: 'Mobil' },
    { value: 'sepeda', label: 'Sepeda' }
  ],
  perhiasan: [
    { value: 'cincin', label: 'Cincin' },
    { value: 'kalung', label: 'Kalung' },
    { value: 'gelang', label: 'Gelang' }
  ],
  uang: [
    { value: 'tunai', label: 'Uang Tunai' },
    { value: 'dompet', label: 'Dompet dengan Uang' }
  ],
  lainnya: [
    { value: 'tas', label: 'Tas' },
    { value: 'pakaian', label: 'Pakaian' },
    { value: 'lainnya', label: 'Lainnya' }
  ]
};

export const BENTUK_BARANG: Record<string, Array<{value: string, label: string}>> = {
  dokumen: [
    { value: 'kartu', label: 'Kartu' },
    { value: 'buku', label: 'Buku' },
    { value: 'sertifikat', label: 'Sertifikat' }
  ],
  elektronik: [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' }
  ],
  kendaraan: [
    { value: 'matic', label: 'Matic' },
    { value: 'manual', label: 'Manual' },
    { value: 'listrik', label: 'Listrik' }
  ],
  perhiasan: [
    { value: 'emas', label: 'Emas' },
    { value: 'perak', label: 'Perak' },
    { value: 'platinum', label: 'Platinum' }
  ],
  uang: [
    { value: 'tunai', label: 'Tunai' },
    { value: 'dompet', label: 'Dompet' }
  ],
  lainnya: [
    { value: 'tas', label: 'Tas' },
    { value: 'pakaian', label: 'Pakaian' },
    { value: 'lainnya', label: 'Lainnya' }
  ]
};

export const SATUAN = [
  { value: 'unit', label: 'Unit' },
  { value: 'buah', label: 'Buah' },
  { value: 'lembar', label: 'Lembar' },
  { value: 'set', label: 'Set' },
  { value: 'pasang', label: 'Pasang' }
]; 