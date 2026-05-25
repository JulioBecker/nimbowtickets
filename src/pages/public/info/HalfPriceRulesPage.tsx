import { Container, Typography, Box, Button, Stack, Card } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

export default function HalfPriceRulesPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
          Meia Entrada & Regras
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#8E33FF', mb: 5, fontWeight: 'bold' }}>
          Saiba quem tem direito ao benefício da meia-entrada e quais as regras para acesso aos eventos.
        </Typography>

        <Stack spacing={4} sx={{ color: '#4B5563', lineHeight: 1.8 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              1. Lei da Meia-Entrada (Lei Federal 12.933/13)
            </Typography>
            <Typography variant="body1">
              A legislação federal garante o benefício da meia-entrada em 40% do total de ingressos disponíveis para cada evento de lazer e entretenimento.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              2. Beneficiários Garantidos por Lei
            </Typography>
            <Typography variant="body1" component="div">
              <ul>
                <li><strong>Estudantes:</strong> Devem apresentar a Carteira de Identificação Estudantil (CIE) emitida pela ANPG, UNE, UBES, entidades estaduais e municipais filiadas, no padrão nacional unificado.</li>
                <li><strong>Idosos:</strong> Pessoas com idade igual ou superior a 60 anos, mediante apresentação de documento oficial com foto.</li>
                <li><strong>Pessoas com Deficiência (PcD):</strong> PcD e seu acompanhante (quando necessário) possuem direito à meia-entrada apresentando o Cartão de Benefício de Prestação Continuada (BPC) ou documento emitido pelo INSS.</li>
                <li><strong>Jovens de Baixa Renda:</strong> Jovens de 15 a 29 anos inscritos no Cadastro Único para Programas Sociais do Governo Federal (CadÚnico), apresentando a carteira ID Jovem acompanhada de documento oficial com foto.</li>
              </ul>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              3. Benefícios Regionais
            </Typography>
            <Typography variant="body1">
              Professores da rede pública ou privada, doadores de sangue registrados, e outras categorias podem possuir direito a benefício estadual ou municipal dependendo da localidade onde o evento está sendo realizado. Consulte a página de compra do evento específico.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ color: '#111111', fontWeight: 'bold', mb: 2 }}>
              4. Comprovação no Acesso
            </Typography>
            <Typography variant="body1">
              A comprovação do direito ao benefício é obrigatória no momento do acesso ao evento, mediante apresentação do respectivo documento válido atualizado. A ausência de comprovação sujeita o participante ao pagamento do valor complementar do ingresso (diferença para inteira) diretamente na bilheteria local do evento.
            </Typography>
          </Box>
        </Stack>
        </Card>
      </Container>
    </Box>
  );
}
