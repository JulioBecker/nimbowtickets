import { useState } from 'react';
import { Box, Card, Container, Typography, TextField, Button, Stack, CircularProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/user/forgot', { email, device: 'web' });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro. Verifique o e-mail ou tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F5F7', py: 8 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: 4, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#ffffff' }}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111111' }}>
              Recuperar Senha
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
              Digite seu e-mail para receber as instruções de recuperação
            </Typography>
          </Box>

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 'bold', mb: 3 }}>
                E-mail de recuperação enviado com sucesso!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                Verifique sua caixa de entrada (e a pasta de spam) para criar uma nova senha.
              </Typography>
              <Button component={RouterLink} to={paths.auth.login} fullWidth variant="outlined" sx={{ fontWeight: 'bold', py: 1.5, borderRadius: 50 }}>
                Voltar para o Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Endereço de E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />

                {error && (
                  <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  sx={{ bgcolor: '#8E33FF', color: '#ffffff', fontWeight: 'bold', py: 1.5, fontSize: 15, '&:hover': { bgcolor: '#7a22e8' } }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Enviar E-mail de Recuperação'}
                </Button>

                <Button component={RouterLink} to={paths.auth.login} sx={{ color: '#111111', fontWeight: 600, textTransform: 'none' }}>
                  Voltar
                </Button>
              </Stack>
            </Box>
          )}

        </Card>
      </Container>
    </Box>
  );
}
