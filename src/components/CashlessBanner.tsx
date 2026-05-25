import { Box, Container, Typography, Grid, Card } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function CashlessBanner() {
  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
      {/* Background gradients */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(142,51,255,0.05) 0%, transparent 70%)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,234,0,0.08) 0%, transparent 70%)', zIndex: 0 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={8} alignItems="center">
          
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="overline" sx={{ color: '#8E33FF', fontWeight: 900, letterSpacing: 2, display: 'block', mb: 1 }}>
                TECNOLOGIA DE PONTA
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#111111', mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}>
                Sistema <Box component="span" sx={{ color: '#9BEA00', bgcolor: '#111111', px: 1.5, pb: 0.5, borderRadius: 2, display: 'inline-block', transform: 'rotate(-2deg)' }}>Cashless</Box>
                <br />Integrado
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', mb: 5, fontSize: '1.1rem', maxWidth: 480, lineHeight: 1.6 }}>
                Diga adeus às filas gigantes e problemas com troco. Nossa tecnologia NFC permite pagamentos ultrarrápidos via pulseira ou cartão, garantindo o melhor consumo para o seu público e controle de estoque em tempo real para o produtor.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(142,51,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E33FF' }}>
                    <Iconify icon="mdi:nfc" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111111' }}>Pagamentos por Aproximação</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Transações seguras via pulseiras ou cartões NFC.</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(155,234,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#68a100' }}>
                    <Iconify icon="carbon:chart-line-smooth" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111111' }}>Dashboard em Tempo Real</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Acompanhe as vendas de bar e consumo no minuto.</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(17,17,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}>
                    <Iconify icon="carbon:wireless-checkout" width={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111111' }}>Gestão PDV Completa</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Controle de estoque, caixas móveis e fechamento rápido.</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', width: '100%', height: { xs: 400, md: 500 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Blur effects */}
              <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bgcolor: '#9BEA00', filter: 'blur(80px)', opacity: 0.15, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', bgcolor: '#8E33FF', filter: 'blur(80px)', opacity: 0.1, top: '20%', right: '10%' }} />

              {/* Main Card (Machine/Phone) */}
              <Card sx={{ 
                width: 280, 
                height: 440, 
                borderRadius: '32px', 
                bgcolor: '#111111', 
                position: 'relative', 
                zIndex: 2,
                boxShadow: '0 32px 64px rgba(0,0,0,0.15)',
                border: '8px solid #ffffff', // white bezel
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 0,
                overflow: 'hidden'
              }}>
                <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Iconify icon="mdi:nfc" width={32} color="#9BEA00" />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>NIMBOW POS</Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', my: 'auto' }}>
                    <Iconify icon="carbon:checkmark-filled" width={72} color="#9BEA00" sx={{ mb: 2, filter: 'drop-shadow(0 0 15px rgba(155,234,0,0.4))' }} />
                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 1 }}>Pagamento Aprovado</Typography>
                    <Typography variant="h3" sx={{ color: '#9BEA00', fontWeight: 900 }}>R$ 45,00</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, display: 'block' }}>2x Cerveja Artesanal</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: 80, height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Box>
                </Box>
                
                {/* Background glow in the phone screen */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(135deg, rgba(142,51,255,0.2) 0%, transparent 100%)', zIndex: 0 }} />
              </Card>

              {/* Floating Element 1 */}
              <Card sx={{ 
                position: 'absolute', 
                bottom: 60, 
                left: { xs: 0, md: -30 }, 
                p: 2, 
                borderRadius: '16px', 
                bgcolor: 'rgba(255,255,255,0.95)', 
                backdropFilter: 'blur(10px)', 
                zIndex: 3, 
                boxShadow: '0 12px 32px rgba(0,0,0,0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2 
              }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#9BEA00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}>
                  <Iconify icon="carbon:flash" width={22} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', fontWeight: 600 }}>Velocidade média</Typography>
                  <Typography variant="subtitle1" sx={{ color: '#111111', fontWeight: 900, lineHeight: 1.2 }}>0.3s por recarga</Typography>
                </Box>
              </Card>

              {/* Floating Element 2 */}
              <Card sx={{ 
                position: 'absolute', 
                top: 80, 
                right: { xs: 0, md: -20 }, 
                p: 2, 
                borderRadius: '16px', 
                bgcolor: 'rgba(17,17,17,0.95)', 
                backdropFilter: 'blur(10px)', 
                zIndex: 3, 
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Iconify icon="carbon:chart-bar" width={24} color="#8E33FF" />
                <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>+40% em Vendas</Typography>
              </Card>

            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
