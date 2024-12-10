'use client';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af',
    },
    background: {
      default: '#f9fafb',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h4: {
      fontWeight: 700,
      fontFamily: 'var(--font-poppins), sans-serif',
    },
    button: {
      fontFamily: 'var(--font-inter), sans-serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
} 