import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Política de Privacidade
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Sua segurança e privacidade de dados são prioridades na Nimbow Tickets.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. Coleta de Informações
            </Typography>
            <Typography variant="body1">
              Coletamos informações necessárias para a emissão de ingressos, controle de acesso físico aos eventos e processamento seguro de pagamentos. Esses dados incluem nome completo, CPF, e-mail, telefone e informações de pagamento criptografadas.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Uso e Proteção de Dados (LGPD)
            </Typography>
            <Typography variant="body1">
              Todos os dados pessoais coletados pela Nimbow Tickets são tratados em conformidade estrita com a Lei Geral de Proteção de Dados (LGPD). Seus dados são utilizados exclusivamente para garantir a segurança da sua compra e a validação do seu ingresso no evento. Nós nunca comercializamos ou compartilhamos seus dados com terceiros para fins de marketing.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Segurança de Pagamentos e Cartões
            </Typography>
            <Typography variant="body1">
              Nossa plataforma utiliza conexões SSL de 256 bits e atende aos mais rígidos padrões internacionais de segurança. Os dados do seu cartão de crédito são processados diretamente por gateways de pagamento homologados PCI-DSS, nunca sendo gravados em texto claro ou armazenados localmente no seu dispositivo.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Seus Direitos
            </Typography>
            <Typography variant="body1">
              Você pode, a qualquer momento, solicitar a visualização, retificação ou exclusão de seus dados pessoais armazenados em nossos servidores enviando uma requisição por meio de nossos canais de atendimento oficiais.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              5. Cookies
            </Typography>
            <Typography variant="body1">
              Utilizamos cookies estritamente necessários para manter a integridade da sua sessão de compra e garantir que as reservas de ingressos no carrinho ocorram com estabilidade e proteção contra fraudes.
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
