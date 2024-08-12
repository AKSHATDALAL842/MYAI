import React from "react";
import { Typography, Box, Button, createTheme, ThemeProvider } from "@mui/material";
import { signIn } from "next-auth/react";
import GoogleIcon from '@mui/icons-material/Google';

const heroTheme = createTheme({
    palette: {
        primary: { main: '#FEEBA0' },
        text: {
            primary: '#FEEBA0',
            secondary: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

export default function Hero() {
    return (
        <ThemeProvider theme={heroTheme}>
            <Box
                width="100vw"
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    backgroundColor: '#0A0A0A', // Base color
                    backgroundImage: `
                        radial-gradient(#303030 1px, transparent 1px), 
                        linear-gradient(180deg, rgba(10, 10, 10, 0.8) 0%, rgba(48, 48, 48, 0.8) 100%)
                    `,
                    backgroundSize: '20px 20px, 100% 100%', // SVG dots first, then gradient
                }}
            >
                <Typography 
                    variant="h1" 
                    fontWeight="500"  
                    sx={{ 
                        mb: 2,
                        background: 'linear-gradient(to right, #FEEBA0 0%, #F5631A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        px: 2,
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '6rem' },
                    }}
                >
                    AI customer support
                </Typography>
                <Typography 
                    variant="h5" 
                    fontWeight="300" 
                    color="text.secondary"
                    sx={{ 
                        mb: 5,
                        textAlign: 'center',
                        px: 2,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    }}
                >
                    Chat with our AI assistant to get help with any issue
                </Typography>
                <Button 
                    startIcon={<GoogleIcon />} 
                    variant="contained" 
                    color="primary"
                    onClick={() => signIn('google')} 
                    sx={{ 
                        mb: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 'medium',
                        fontSize: '1rem',
                        backgroundColor: '#FEEBA0',
                        color: '#0A0A0A',
                        '&:hover': {
                            backgroundColor: '#F5D78B',
                        },
                    }}
                >
                    SIGN IN WITH GOOGLE
                </Button>
            </Box>
        </ThemeProvider>
    );
}
