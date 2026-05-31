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
  LinearProgress,
  Divider,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthStore } from 'src/store/auth';
import { useUserStore } from 'src/store/user';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { masks } from 'src/utils/masks';
import Notiflix from 'notiflix';

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthColors = ['', '#ff5630', '#ffab00', '#2196f3', '#00C853'];
const strengthLabels = ['', 'Fraca', 'Regular', 'Boa', 'Forte'];

export default function Register() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !document) {
      Notiflix.Notify.failure('Nome, e-mail, CPF e senha são obrigatórios.');
      return;
    }
    const cleanCPF = document.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      Notiflix.Notify.warning('Digite um CPF válido com 11 dígitos.');
      return;
    }
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      Notiflix.Notify.warning('A senha deve ter no mínimo 6 caracteres, conter pelo menos uma letra maiúscula e um número.');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/user/register', { name, email, password, phone, document });
      const { data } = await axiosInstance.post('/user/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      Notiflix.Notify.success('Bem-vindo à Nimbow Tickets! Conta criada com sucesso.');
      navigate(paths.dashboard.root);
    } catch (err: any) {
      console.error(err);
      Notiflix.Notify.failure(err?.response?.data?.error || err?.message || 'Falha ao realizar cadastro. Tente outro e-mail.');
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
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111111', letterSpacing: '-0.5px' }}>
              Criar Conta
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Compre ingressos, crie eventos e gerencie sua carteira cashless.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>Nome Completo *</Typography>
                <TextField
                  fullWidth
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    sx: inputStyles,
                    startAdornment: <InputAdornment position="start"><Iconify icon="carbon:user" sx={{ color: 'text.secondary' }} /></InputAdornment>
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>E-mail *</Typography>
                <TextField
                  fullWidth
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  InputProps={{
                    sx: inputStyles,
                    startAdornment: <InputAdornment position="start"><Iconify icon="carbon:email" sx={{ color: 'text.secondary' }} /></InputAdornment>
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>CPF *</Typography>
                <TextField
                  fullWidth
                  placeholder="000.000.000-00"
                  value={document}
                  onChange={(e) => setDocument(masks.cpf(e.target.value))}
                  required
                  InputProps={{
                    sx: inputStyles,
                    startAdornment: <InputAdornment position="start"><Iconify icon="carbon:identification" sx={{ color: 'text.secondary' }} /></InputAdornment>
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>Celular (opcional)</Typography>
                <TextField
                  fullWidth
                  placeholder="(41) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{
                    sx: inputStyles,
                    startAdornment: <InputAdornment position="start"><Iconify icon="carbon:phone" sx={{ color: 'text.secondary' }} /></InputAdornment>
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#111111' }}>Senha *</Typography>
                <TextField
                  fullWidth
                  placeholder="Digite uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  InputProps={{
                    sx: inputStyles,
                    startAdornment: <InputAdornment position="start"><Iconify icon="carbon:password" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#8E33FF' }}>
                          <Iconify icon={showPassword ? 'carbon:view' : 'carbon:view-off'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {password && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(strength / 4) * 100}
                      sx={{
                        height: 5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: strengthColors[strength], borderRadius: 3 }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: strengthColors[strength], fontWeight: 'bold' }}>
                        Força: {strengthLabels[strength]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Use maiúsculas, números e símbolos
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" align="center" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5, fontSize: 11 }}>
                  Ao se cadastrar, você concorda com nossos{' '}
                  <RouterLink to={paths.tickets.termsOfUse} style={{ color: '#8E33FF', fontWeight: 'bold', textDecoration: 'none' }}>
                    Termos de Serviço
                  </RouterLink>{' '}
                  e{' '}
                  <RouterLink to={paths.tickets.privacyPolicy} style={{ color: '#8E33FF', fontWeight: 'bold', textDecoration: 'none' }}>
                    Política de Privacidade
                  </RouterLink>
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', py: 1.5, fontSize: 16, borderRadius: '12px', '&:hover': { bgcolor: '#8ade00' } }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#111111' }} /> : 'Cadastrar'}
              </Button>

              <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mt: 2 }}>
                Já possui uma conta?{' '}
                <Button component={RouterLink} to={paths.auth.login} sx={{ color: '#8E33FF', fontWeight: 'bold', textTransform: 'none', p: 0, minWidth: 0 }}>
                  Entrar ›
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
