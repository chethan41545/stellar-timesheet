import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        customColors: {
            surface: string;
            surfaceDark?: string;
            sidebar: string;
            accent: string;
        };
    }
    interface ThemeOptions {
        customColors?: {
            surface?: string;
            surfaceDark?: string;
            sidebar?: string;
            accent?: string;
        };
    }
}

export const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#009ef1',
            light: '#51a9d8ff',
            dark: '#007fc4ff',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#FFFFFF', // Cool gray
            light: '#FFFFFF',
            dark: '#FFFFFF',
            contrastText: '#000000',
        },
        background: {
            default: '#ECEFF1', // Light blue-gray
            paper: '#FFFFFF',   // White
        },
        text: {
            primary: '#202224',
            secondary: '#565656',
            disabled: '#9e9e9e',
        },
        error: {
            main: '#D32F2F',
        },
        warning: {
            main: '#FFA000',
        },
        info: {
            main: '#0288D1',
        },
        success: {
            main: '#388E3C',
        },
    },

    customColors: {
        surface: '#ffffff',       // Lighter blue-gray
        surfaceDark: '#ffffff',       // Lighter blue-gray
        sidebar: '#B0BEC5',       // Cool gray
        accent: '#1565C0',        // Professional Blue accent
    },

    typography: {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 14, // Base font size reduced from default 16
        h1: {
            fontSize: '2.2rem', // Reduced from 2.5-3rem
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '1.8rem', // Reduced from 2-2.5rem
            fontWeight: 700,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '32px', // Reduced from 1.75-2rem
            fontWeight: 700,
            lineHeight: 1.3,
            opacity: '70%'
        },
        h4: {
            fontSize: '1.3rem', // Reduced from 1.5-1.75rem
            fontWeight: 700,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.1rem', // Reduced from 1.25-1.5rem
            fontWeight: 700,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '18px', // Reduced from 1.1-1.25rem
            fontWeight: 700,
            lineHeight: 1.0,
        },
        subtitle1: {
            fontSize: '16px', // Reduced from 1rem
            fontWeight: 500,
            lineHeight: 1,
        },
        subtitle2: {
            fontSize: '12px', // Reduced from 0.875rem
            fontWeight: 400,
            lineHeight: 1,
        },
        body1: {
            fontSize: '12px', // Reduced from 1rem
            fontWeight: 400,
            lineHeight: 1,
        },
        body2: {
            fontSize: '12px', // Reduced from 0.875rem
            fontWeight: 400,
            lineHeight: 1.0,
        },
        button: {
            fontSize: '0.8rem', // Reduced from 0.875rem
            fontWeight: 500,
            textTransform: 'none', // Optional: if you prefer buttons without uppercase
        },
        caption: {
            fontSize: '0.7rem', // Reduced from 0.75rem
            fontWeight: 400,
            lineHeight: 1.5,
        },
        overline: {
            fontSize: '0.65rem', // Reduced from 0.75rem
            fontWeight: 500,
            lineHeight: 1.5,
            textTransform: 'uppercase',
        },
    },
});