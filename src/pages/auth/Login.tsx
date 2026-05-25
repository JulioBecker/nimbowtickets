import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthStore } from 'src/store/auth';
import { useUserStore } from 'src/store/user';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Notiflix from 'notiflix';

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Notiflix.Notify.failure('E-mail e senha são obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/user/login', { email, password });
      
      setToken(data.token);
      setUser(data.user);
      
      Notiflix.Notify.success('Bem-vindo ao Nimbow Tickets!');
      navigate(paths.dashboard.root);
    } catch (err: any) {
      console.error(err);
      Notiflix.Notify.failure(err?.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    bgcolor: '#ffffff',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
    '&.Mui-focused fieldset': { borderColor: '#8E33FF' },
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F5F7', py: 8 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, color: '#111111', mb: 4, letterSpacing: '-0.5px' }}>
            Faça login em sua conta
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>E-mail ou CPF</Typography>
                <TextField
                  fullWidth
                  placeholder="Digite seu e-mail ou CPF"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  InputProps={{ sx: inputStyles }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111111' }}>Senha</Typography>
                  <Button component={RouterLink} to={paths.auth.forgotPassword} sx={{ color: '#8E33FF', fontWeight: 600, p: 0, minWidth: 0, fontSize: '0.85rem' }}>
                    Esqueceu sua senha? ›
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  InputProps={{
                    sx: inputStyles,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#8E33FF' }}>
                          <Iconify icon={showPassword ? 'carbon:view' : 'carbon:view-off'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', py: 1.5, fontSize: 16, borderRadius: '12px', '&:hover': { bgcolor: '#8ade00' } }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#111111' }} /> : 'Entrar'}
              </Button>

              <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 2 }}>
                Não tem uma conta?{' '}
                <Button component={RouterLink} to={paths.auth.register} sx={{ color: '#8E33FF', fontWeight: 'bold', textTransform: 'none', p: 0, minWidth: 0 }}>
                  Cadastre-se ›
                </Button>
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, color: '#111111' }}>
              <Iconify icon="carbon:help" sx={{ color: '#8E33FF' }} /> Ajuda ao cliente
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button fullWidth variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.15)', color: '#111111', fontWeight: 600 }}>Suporte</Button>
              <Button fullWidth variant="outlined" sx={{ borderRadius: '12px', borderColor: 'rgba(0,0,0,0.15)', color: '#111111', fontWeight: 600 }}>Termos e Políticas</Button>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
