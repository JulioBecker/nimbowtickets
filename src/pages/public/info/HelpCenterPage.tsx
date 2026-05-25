import { Container, Typography, Box, Button, Stack, Card, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

const faqs = [
  {
    q: 'Como recebo meus ingressos após a compra?',
    a: 'Seus ingressos são gerados e disponibilizados instantaneamente na Área do Cliente, na aba "Meus Ingressos". Uma cópia em PDF também é enviada automaticamente para o e-mail cadastrado.',
  },
  {
    q: 'Posso transferir um ingresso para outra pessoa?',
    a: 'Sim. A transferência de titularidade pode ser solicitada com até 24 horas de antecedência do evento diretamente pelo nosso suporte via WhatsApp ou e-mail.',
  },
  {
    q: 'Como solicito estorno do saldo Cashless?',
    a: 'Acesse a Área do Cliente, vá na aba "Meu Cash" e clique em "Solicitar Estorno" ao lado do evento desejado. O prazo para solicitação é até 72 horas após o término do evento.',
  },
  {
    q: 'O que fazer se meu QR Code não estiver funcionando?',
    a: 'Verifique o brilho da tela do seu dispositivo e certifique-se de que está apresentando o QR Code da aba "Meus Ingressos". Caso o problema persista, dirija-se ao balcão de suporte no evento com seu CPF e documento.',
  },
  {
    q: 'Como criar um evento na plataforma Nimbow?',
    a: 'Acesse sua Área do Cliente, vá na aba "Criar Evento" e preencha o fluxo guiado em 4 etapas. Após envio, o evento passa por revisão da equipe Nimbow antes de ser publicado.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos PIX (confirmação imediata) e Cartão de Crédito (parcelamento sujeito a disponibilidade por evento). Todos os pagamentos são processados com criptografia SSL 256-bit.',
  },
];

export default function HelpCenterPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
            Central de Ajuda
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 6, fontWeight: 'bold' }}>
            Encontre respostas rápidas para as dúvidas mais frequentes sobre ingressos, eventos e pagamentos.
          </Typography>

          {/* FAQ Section */}
          <Stack spacing={2} sx={{ mb: 8 }}>
            {faqs.map((item, idx) => (
              <Box key={idx} sx={{ bgcolor: '#F9FAFB', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111', mb: 1 }}>
                  {item.q}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  {item.a}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Contact CTA */}
          <Box
            sx={{
              bgcolor: '#F9FAFB',
              border: '1px solid rgba(142, 51, 255,0.2)',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#111111' }}>
              Não encontrou o que precisava?
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Nossa equipe de suporte está disponível para ajudar você.
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  href="https://wa.me/5541988917885?text=Olá! Preciso de ajuda com minha conta Nimbow."
                  target="_blank"
                  startIcon={<Iconify icon="mdi:whatsapp" />}
                  sx={{ bgcolor: '#25D366', color: '#ffffff', fontWeight: 'bold', py: 1.5, px: 3, '&:hover': { bgcolor: '#22c05b' } }}
                >
                  WhatsApp Suporte
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => navigate(paths.tickets.contactUs)}
                  startIcon={<Iconify icon="carbon:email" />}
                  sx={{ borderColor: '#8E33FF', color: '#8E33FF', fontWeight: 'bold', py: 1.5, px: 3, '&:hover': { borderColor: '#7a19e6', bgcolor: 'rgba(142, 51, 255, 0.05)' } }}
                >
                  Fale Conosco
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
