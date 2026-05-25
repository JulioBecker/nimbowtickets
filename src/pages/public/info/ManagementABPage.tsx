import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function ManagementABPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Gestão Alimentos & Bebidas (A&B)
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Aumente a eficiência operacional e elimine desvios de estoque nos pontos de venda do seu evento.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. Controle de Estoque em Tempo Real
            </Typography>
            <Typography variant="body1">
              A Nimbow oferece um ecossistema completo para controle de vendas de bebidas, alimentos e itens promocionais. Com nossos painéis integrados, os organizadores visualizam a velocidade de saída de cada produto por ponto de bar em tempo real, permitindo remanejamentos inteligentes de estoque antes que a falta aconteça.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Terminais POS Modernos
            </Typography>
            <Typography variant="body1">
              Nossos equipamentos POS portáteis são projetados para transações extremamente rápidas. O atendente do bar registra a venda e lê o cartão ou pulseira NFC do participante em menos de 3 segundos, garantindo filas menores e um faturamento significativamente superior para a praça de alimentação.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Auditoria Física e Financeira
            </Typography>
            <Typography variant="body1">
              Todas as vendas são gravadas localmente nos terminais com criptografia e sincronizadas com a nuvem automaticamente quando há sinal. Isso garante consistência de auditoria física de fichas vs inventário estocado e evita qualquer tipo de fraude interna em operações de grande escala.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Como contratar para seu evento?
            </Typography>
            <Typography variant="body1">
              Se você é produtor e deseja implantar a tecnologia Nimbow de gestão de bares no seu próximo evento, entre em contato direto com a nossa equipe de especialistas pelo WhatsApp Suporte ou envie um e-mail para contato@nimbow.com.br.
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
