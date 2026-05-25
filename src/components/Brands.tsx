import { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLanguageStore } from '../store/useLanguageStore';

const BrandItem = ({ brand }: { brand: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    let animationFrameId: number;
    const checkPosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        // Movemos o ponto de foco um pouco mais para a esquerda (42% da tela em vez de 50%)
        const focalPoint = window.innerWidth * 0.42;
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(focalPoint - itemCenter);
        // Calcula a zona de efeito (começa a crescer quando entra no meio da tela)
        const maxDistance = window.innerWidth / 2.5;

        const normalizedDistance = Math.min(distance / maxDistance, 1);
        // Efeito mais sutil de crescimento
        const newScale = 1 + (1 - normalizedDistance) * 0.2; // max scale 1.2
        const newOpacity = 0.4 + (1 - normalizedDistance) * 0.6; // max opacity 1.0

        setScale(newScale);
        setOpacity(newOpacity);
      }
      animationFrameId = requestAnimationFrame(checkPosition);
    };
    checkPosition();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <Box ref={ref} sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      px: { xs: 4, md: 6 }, 
      gap: { xs: 4, md: 6 },
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      opacity: opacity,
      willChange: 'transform, opacity'
    }}>
      <Typography sx={{
        fontSize: { xs: 24, md: 36 },
        fontWeight: 900,
        color: scale > 1.1 ? '#9BEA00' : '#ffffff',
        letterSpacing: '-1.5px',
        whiteSpace: 'nowrap',
        cursor: 'default',
        transition: 'color 0.3s ease'
      }}>
        {brand}
      </Typography>
      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#9BEA00', opacity: 0.8, boxShadow: '0 0 10px #9BEA00' }} />
    </Box>
  );
};

const Brands = () => {
  const { t } = useLanguageStore();

  // Array de marcas base
  const baseBrands = [
    "DISNEY CELEBRA",
    "K-1 BRAZIL",
    "CUPOLA SUMMIT",
    "ADEMICON SUMMIT",
    "MX1 GP",
    "RISOTO SOLIDÁRIO",
    "TRUCK FEST"
  ];

  // Duplica o array para criar o efeito de loop infinito
  const brands = [...baseBrands, ...baseBrands, ...baseBrands];

  return (
    <Box sx={{
      py: 10,
      bgcolor: '#1A0A33',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', mb: 7 }}>
        <Typography variant="overline" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: 2 }}>
          {t('landing.brands.title')}
        </Typography>
      </Box>

      {/* Área da animação */}
      <Box sx={{
        display: 'flex',
        width: 'max-content',
        animation: 'scrollBrands 40s linear infinite',
        willChange: 'transform'
      }}>
        {brands.map((brand, idx) => (
          <BrandItem key={idx} brand={brand} />
        ))}
      </Box>

      {/* Gradientes nas laterais */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '15%', background: 'linear-gradient(to right, #1A0A33 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '15%', background: 'linear-gradient(to left, #1A0A33 0%, transparent 100%)', zIndex: 1, pointerEvents: 'none' }} />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scrollBrands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
      `}} />
    </Box>
  );
};

export default Brands;
