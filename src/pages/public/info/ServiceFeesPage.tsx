import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function ServiceFeesPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Taxas de Serviço
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Transparência total sobre as taxas e custos de processamento financeiro na Nimbow.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. Por que cobramos taxas de serviço?
            </Typography>
            <Typography variant="body1">
              A Nimbow Tickets cobra uma taxa de conveniência/serviço para financiar a infraestrutura de servidores, manter sistemas seguros de antifraude e biometria, desenvolver integrações físicas para eventos (leitores NFC, POS) e oferecer canais de suporte rápido aos consumidores e produtores.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Valores das Taxas para Consumidores
            </Typography>
            <Typography variant="body1">
              A taxa de serviço cobrada no momento da compra de ingressos online é de 10% sobre o valor nominal de cada ingresso pago. Eventos com ingressos gratuitos não possuem qualquer tipo de taxa de conveniência associada.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Taxas de Parcelamento
            </Typography>
            <Typography variant="body1">
              O parcelamento de compras via Cartão de Crédito é disponibilizado pela plataforma. A quantidade de parcelas sem juros ou as taxas financeiras aplicáveis ao parcelamento podem variar por evento, sendo detalhadas de forma clara no momento do preenchimento das opções de pagamento na tela de Checkout.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Taxas de Operações NFC Cashless
            </Typography>
            <Typography variant="body1">
              A ativação do cartão NFC ou pulseira inteligente de consumo no evento físico pode possuir uma taxa de ativação única de até R$ 5,00 (reembolsável caso o cartão seja devolvido em perfeito estado físico nos caixas oficiais ao final do evento).
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
