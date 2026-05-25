import { useState } from 'react';
import {
  Container, Typography, Box, Button, Stack, TextField, Grid, Card,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'axios';

const contactChannels = [
  {
    icon: 'mdi:whatsapp',
    label: 'WhatsApp',
    value: '+55 41 98891-7885',
    href: 'https://wa.me/5541988917885?text=Olá! Preciso de ajuda com minha conta Nimbow.',
    color: '#25D366',
  },
  {
    icon: 'carbon:email',
    label: 'E-mail',
    value: 'contato@nimbow.com.br',
    href: 'mailto:contato@nimbow.com.br',
    color: '#8E33FF',
  },
  {
    icon: 'mdi:instagram',
    label: 'Instagram',
    value: '@nimbowtickets',
    href: 'https://instagram.com/nimbowtickets',
    color: '#E1306C',
  },
];

export default function ContactUsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // Sends message to internal API endpoint (future integration)
      await axios.post('/api/contact', form);
      setStatus('done');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      // Fallback: redirect user to email client
      const body = encodeURIComponent(`${form.message}\n\n—\n${form.name} | ${form.email}`);
      window.open(`mailto:contato@nimbow.com.br?subject=${encodeURIComponent(form.subject)}&body=${body}`);
      setStatus('done');
    }
  };

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', pt: 4, pb: 8, color: '#111111' }}>
      <Container maxWidth="md">

        <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#111111' }}>
            Fale Conosco
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 6 }}>
            Estamos prontos para ajudar. Escolha o canal que preferir ou envie uma mensagem diretamente.
          </Typography>

          <Grid container spacing={4}>
            {/* Contact channels */}
            <Grid item xs={12} md={5}>
              <Typography variant="overline" sx={{ color: '#8E33FF', fontWeight: 'bold', mb: 2, display: 'block' }}>
                Canais de Contato
              </Typography>
              <Stack spacing={2} sx={{ mb: 4 }}>
                {contactChannels.map((ch) => (
                  <Card
                    key={ch.label}
                    component="a"
                    href={ch.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: '#F9FAFB',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 2,
                      p: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      textDecoration: 'none',
                      boxShadow: 'none',
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: ch.color },
                    }}
                  >
                    <Box sx={{ bgcolor: `${ch.color}22`, borderRadius: '50%', p: 1.2 }}>
                      <Iconify icon={ch.icon} sx={{ color: ch.color, width: 24, height: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {ch.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#111111', fontWeight: 'bold' }}>
                        {ch.value}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Stack>

              <Box sx={{ bgcolor: '#F9FAFB', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2, p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#111111', fontWeight: 'bold', mb: 0.5 }}>
                  Horário de Atendimento
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Segunda a Sexta — 09h às 18h
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Sábado — 09h às 13h
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Domingos e feriados fora do ar. Para urgências, use o WhatsApp.
                </Typography>
              </Box>
            </Grid>

            {/* Contact form */}
            <Grid item xs={12} md={7}>
              <Typography variant="overline" sx={{ color: '#8E33FF', fontWeight: 'bold', mb: 2, display: 'block' }}>
                Enviar Mensagem
              </Typography>
              {status === 'done' ? (
                <Box
                  sx={{
                    bgcolor: '#F9FAFB',
                    border: '1px solid rgba(142, 51, 255,0.3)',
                    borderRadius: 2,
                    p: 5,
                    textAlign: 'center',
                  }}
                >
                  <Iconify icon="carbon:checkmark-filled" sx={{ color: '#8E33FF', width: 48, height: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#111111', fontWeight: 'bold', mb: 1 }}>
                    Mensagem enviada!
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Nossa equipe retornará em até 1 dia útil.
                  </Typography>
                  <Button
                    onClick={() => setStatus('idle')}
                    sx={{ color: '#8E33FF', fontWeight: 'bold', border: '1px solid rgba(142, 51, 255, 0.3)', '&:hover': { borderColor: '#7a19e6', bgcolor: 'rgba(142, 51, 255, 0.05)' } }}
                  >
                    Enviar outra mensagem
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      name="name"
                      label="Nome completo"
                      value={form.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      inputProps={{ maxLength: 80 }}
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: '#ffffff' },
                      }}
                    />
                    <TextField
                      name="email"
                      label="E-mail"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      inputProps={{ maxLength: 100 }}
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: '#ffffff' },
                      }}
                    />
                    <TextField
                      name="subject"
                      label="Assunto"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      fullWidth
                      inputProps={{ maxLength: 120 }}
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: '#ffffff' },
                      }}
                    />
                    <TextField
                      name="message"
                      label="Mensagem"
                      value={form.message}
                      onChange={handleChange}
                      required
                      fullWidth
                      multiline
                      rows={5}
                      inputProps={{ maxLength: 2000 }}
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: '#ffffff' },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={status === 'sending'}
                      sx={{
                        bgcolor: '#9BEA00',
                        color: '#111111',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '0.95rem',
                        '&:hover': { bgcolor: '#8ade00' },
                      }}
                    >
                      {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
