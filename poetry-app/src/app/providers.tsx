'use client';

import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

function MUIThemeWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

    const theme = createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#0d6cf2',
        },
        background: {
          default: '#000000',
          paper: 'rgba(29, 29, 31, 0.7)',
        },
      },
    typography: {
      fontFamily: 'var(--font-sans), sans-serif',
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 9999,
            padding: '12px 24px',
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0d6cf2',
              },
              color: '#ffffff',
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
            },
            '& .MuiInputLabel-root': {
              color: '#94a3b8',
            },
          }),
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: '1rem',
          }
        }
      }
    },
  });

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline enableColorScheme={false} />
      {children}
    </MUIThemeProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <NextThemesProvider attribute="class" forcedTheme="dark">
        <MUIThemeWrapper>
          {children}
        </MUIThemeWrapper>
      </NextThemesProvider>
    </JotaiProvider>
  );
}
