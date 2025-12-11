import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../themes/theme.tsx';

interface Props {
    children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<Props> = ({ children }) => {
    // Get your theme object (assuming Theme is already properly configured)

    // Simply wrap children with ThemeProvider
    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
};

