import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function CashlessNfcPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Operação Cashless NFC
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Pagamentos sem dinheiro físico com pulseiras e cartões inteligentes. Mais rápido, seguro e prático.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. O que é a tecnologia Cashless NFC?
            </Typography>
            <Typography variant="body1">
              É o sistema de pagamentos de consumo por aproximação da Nimbow. Em vez de lidar com dinheiro físico, fichas de papel ou passar cartões bancários em toda compra no bar, o participante carrega créditos digitais em um cartão inteligente ou pulseira com chip NFC oficial do evento.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Como carregar créditos?
            </Typography>
            <Typography variant="body1">
              O saldo digital pode ser carregado previamente de forma online na Área do Cliente (aba "Meu Cash") usando o seu CPF, ou diretamente no evento físico nos caixas fixos e móveis usando Pix, cartão ou dinheiro.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Estorno de Saldo Sobrante
            </Typography>
            <Typography variant="body1">
              Sobrou saldo após o encerramento do evento? Não se preocupe! A solicitação de estorno pode ser feita diretamente no nosso site pela aba "Meu Cash" da sua Área do Cliente em até 72 horas após o término do evento. O valor será enviado para sua conta bancária via Pix.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Em caso de perda do cartão ou pulseira
            </Typography>
            <Typography variant="body1">
              Como os créditos são vinculados diretamente ao seu CPF na plataforma Nimbow, em caso de perda do seu cartão físico ou pulseira NFC, dirija-se imediatamente ao balcão de SAC/Ouvidoria no evento com seu documento com foto. Nosso time bloqueará o cartão antigo e transferirá o saldo remanescente para um novo chip NFC.
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
