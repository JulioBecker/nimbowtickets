import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useLanguageStore } from '../store/useLanguageStore';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguageStore();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: '#111111',
      color: '#ffffff',
      zIndex: 9999,
      py: 3,
      borderTop: '2px solid #8E33FF',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
    }}>
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', flex: 1 }}>
          {t('cookies.message')}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleAccept}
          sx={{ 
            bgcolor: '#9BEA00', 
            color: '#111111', 
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#8ade00' }
          }}
        >
          {t('cookies.accept')}
        </Button>
      </Container>
    </Box>
  );
};

export default CookieBanner;
