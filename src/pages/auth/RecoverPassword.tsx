import { useState } from 'react';
import { Box, Card, Container, Typography, TextField, Button, Stack, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import Iconify from 'src/components/iconify';

export default function RecoverPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('A senha deve ter no mínimo 6 caracteres, conter pelo menos uma letra maiúscula e um número.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/user/recover', { token, password });
      // Redirect to login after successful password change
      navigate(paths.auth.login, { state: { message: 'Senha alterada com sucesso! Faça o login.' } });
    } catch (err: any) {
      console.error(err);
      setError('Ocorreu um erro ou o link expirou. Tente solicitar a recuperação novamente.');
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
              Criar Nova Senha
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
              Digite e confirme sua nova senha de acesso.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'carbon:view' : 'carbon:view-off'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
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
                {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Alterar Senha'}
              </Button>

            </Stack>
          </Box>

        </Card>
      </Container>
    </Box>
  );
}
