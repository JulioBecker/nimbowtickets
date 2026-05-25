import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function TermsOfUsePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Termos de Uso
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Termos e condições para compra de ingressos e participação nos eventos da plataforma Nimbow.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. Aceite dos Termos
            </Typography>
            <Typography variant="body1">
              Ao acessar a plataforma Nimbow Tickets e concluir a compra de ingressos, o usuário aceita integralmente as condições descritas nestes Termos de Uso, bem como as políticas de reembolso e regras de cada organizador de evento.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Compra e Titularidade de Ingressos
            </Typography>
            <Typography variant="body1">
              Cada ingresso comprado é nominal e vinculado diretamente ao CPF do comprador ou participante indicado. É responsabilidade do comprador informar os dados corretos no checkout. A validação do ingresso é realizada no controle de acesso do evento por meio de leitura eletrônica de QR Code de uso único.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Cancelamento e Reembolso
            </Typography>
            <Typography variant="body1">
              Em conformidade com o Código de Defesa do Consumidor, o arrependimento da compra pode ser exercido em até 7 (sete) dias a contar da data de compra, desde que não ultrapasse o limite de 48 horas antes do início do evento. Taxas de serviço cobradas pela plataforma Nimbow não são reembolsáveis em caso de cancelamentos solicitados pelo cliente.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Responsabilidade sobre os Eventos
            </Typography>
            <Typography variant="body1">
              A Nimbow Tickets atua exclusivamente como intermediadora tecnológica na venda de ingressos e controle de consumo. Toda a responsabilidade pela organização, produção, segurança, qualidade técnica e realização dos eventos recai inteiramente sobre o produtor responsável indicado na página do evento.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              5. Uso de Tecnologias Cashless NFC
            </Typography>
            <Typography variant="body1">
              O saldo digital recarregado na carteira Nimbow Cashless destina-se ao consumo exclusivo no evento selecionado. Reembolsos de saldos não consumidos podem ser efetuados via painel do cliente no prazo de até 72 horas após o encerramento do evento.
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
