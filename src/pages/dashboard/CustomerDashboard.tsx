import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  MenuItem,
  CardMedia,
  CardContent,
  Chip,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  useMediaQuery,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useUserStore } from 'src/store/user';
import { useAuthStore } from 'src/store/auth';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Notiflix from 'notiflix';



import { useLocation, useNavigate } from 'react-router-dom';

const darkCard = {
  bgcolor: 'background.paper',
  borderRadius: 2,
  color: 'text.primary',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
};

const darkCardNested = {
  bgcolor: 'background.default',
  borderRadius: 2,
  color: 'text.primary',
  border: '1px solid rgba(0, 0, 0, 0.06)',
};

const darkInput = {};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, setUser, logout: logoutUser } = useUserStore();
  const { logout: logoutAuth } = useAuthStore();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = parseInt(searchParams.get('tab') || '0', 10);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const handleLogout = () => {
    logoutAuth();
    logoutUser();
    Notiflix.Notify.info('Você saiu da sua conta.');
    navigate(paths.tickets.root);
  };

  // ─── Tab 0: Meus Dados ───────────────────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [document, setDocument] = useState(user?.document || '');
  const [gender, setGender] = useState(user?.gender || 'masculino');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '');
  const [cep, setCep] = useState(user?.cep || '');
  const [hasDisability, setHasDisability] = useState(user?.hasDisability || false);
  const [updatingUser, setUpdatingUser] = useState(false);

  // ─── Tab 1: Meus Ingressos ───────────────────────────────────────────────
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<any>(null);

  // ─── Tab 2: Favoritos ────────────────────────────────────────────────────
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // ─── Tab 3: Meu Cash (Cashless) ──────────────────────────────────────────
  const [cashlessEvents, setCashlessEvents] = useState<any[]>([]);
  const [selectedCashlessEvent, setSelectedCashlessEvent] = useState<any>('');
  const [cashlessLoadAmount, setCashlessLoadAmount] = useState(50);
  const [cashlessBalances, setCashlessBalances] = useState<any[]>(user?.cashlessBalances || []);
  const [cashlessModalOpen, setCashlessModalOpen] = useState(false);

  // ─── Tab 4: Central de Ajuda ─────────────────────────────────────────────

  // ─── Tab 6: Central de Ajuda ─────────────────────────────────────────────

  // ─── Tab 7 (Admin only): Aprovação de Eventos ────────────────────────────
  const isAdmin = user?.role === 'admin';
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Admin Tab State
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [adminPerPage, setAdminPerPage] = useState(20);
  const [selectedPendingEvents, setSelectedPendingEvents] = useState<string[]>([]);
  const [deletingBulkEvents, setDeletingBulkEvents] = useState(false);
  useEffect(() => {
    if (activeTab === 1) loadMyOrders();
    else if (activeTab === 2) loadFavorites();
    else if (activeTab === 3) loadCashlessEvents();
    else if (isAdmin && activeTab === 5) loadPendingEvents();
  }, [activeTab]);

  const loadMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axiosInstance.get('/order');
      setOrders(data?.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingOrders(false); }
  };

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const { data } = await axiosInstance.get('/event', { params: { active: 'true', perPage: 12 } });
      setFavorites((data?.data || []).slice(0, 6));
    } catch (err) { console.error(err); }
    finally { setLoadingFavorites(false); }
  };

  const loadCashlessEvents = async () => {
    try {
      const { data } = await axiosInstance.get('/event');
      setCashlessEvents(data?.data || []);
    } catch (err) { console.error(err); }
  };



  const loadPendingEvents = async () => {
    setLoadingPending(true);
    try {
      const { data } = await axiosInstance.get('/event', { params: { perPage: 100 } });
      const all: any[] = data?.data || [];
      setPendingEvents(all.filter((e) => e.status === 'pending' || !e.status));
    } catch (err) { console.error(err); }
    finally { setLoadingPending(false); }
  };

  const handleApproveEvent = async (eventId: string) => {
    setApprovingId(eventId);
    try {
      await axiosInstance.put(`/event/${eventId}`, { status: 'approved', active: true });
      Notiflix.Notify.success('Evento aprovado com sucesso!');
      loadPendingEvents();
    } catch (err) {
      Notiflix.Notify.failure('Erro ao aprovar evento.');
    } finally { setApprovingId(null); }
  };

  const handleRejectEvent = async (eventId: string) => {
    setApprovingId(eventId);
    try {
      await axiosInstance.put(`/event/${eventId}`, { status: 'rejected', active: false });
      Notiflix.Notify.warning('Evento rejeitado.');
      loadPendingEvents();
    } catch (err) {
      Notiflix.Notify.failure('Erro ao rejeitar evento.');
    } finally { setApprovingId(null); }
  };

  const handleBulkDeleteEvents = async () => {
    if (selectedPendingEvents.length === 0) return;
    setDeletingBulkEvents(true);
    try {
      await Promise.all(
        selectedPendingEvents.map((id) => axiosInstance.delete(`/event/${id}`))
      );
      Notiflix.Notify.success(`${selectedPendingEvents.length} eventos excluídos com sucesso!`);
      setSelectedPendingEvents([]);
      loadPendingEvents();
    } catch (err) {
      Notiflix.Notify.failure('Erro ao excluir eventos. Podem existir vendas vinculadas.');
    } finally {
      setDeletingBulkEvents(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingUser(true);
    try {
      const { data } = await axiosInstance.put('/user/me', {
        name, email, phone, document, gender,
        birthDate: birthDate ? new Date(birthDate) : null, cep, hasDisability,
      });
      setUser(data);
      Notiflix.Notify.success('Perfil atualizado com sucesso!');
    } catch (err) {
      Notiflix.Notify.failure('Erro ao atualizar perfil.');
    } finally { setUpdatingUser(false); }
  };

  const handleLoadCashlessBalance = async () => {
    if (!selectedCashlessEvent) {
      Notiflix.Notify.warning('Selecione um evento para carregar saldo.');
      return;
    }
    try {
      const currentBalances = [...cashlessBalances];
      const index = currentBalances.findIndex((b) => b.event === selectedCashlessEvent);
      const qrCodeValue = `CPF:${document || user?.document || '00000000000'}|Event:${selectedCashlessEvent}|Balance:${cashlessLoadAmount}|TS:${Date.now()}`;
      if (index > -1) {
        currentBalances[index].balance += cashlessLoadAmount;
        currentBalances[index].qrCode = qrCodeValue;
      } else {
        currentBalances.push({ event: selectedCashlessEvent, balance: cashlessLoadAmount, qrCode: qrCodeValue });
      }
      const { data } = await axiosInstance.put('/user/me', { cashlessBalances: currentBalances });
      setUser(data);
      setCashlessBalances(data.cashlessBalances || []);
      setCashlessModalOpen(false);
      Notiflix.Notify.success(`Recarga de R$ ${cashlessLoadAmount.toFixed(2)} efetuada com sucesso!`);
    } catch (err) {
      Notiflix.Notify.failure('Erro ao processar recarga cashless.');
    }
  };

  const handleRefundCashless = async (eventId: string) => {
    try {
      const currentBalances = cashlessBalances.filter((b) => b.event !== eventId);
      const { data } = await axiosInstance.put('/user/me', { cashlessBalances: currentBalances });
      setUser(data);
      setCashlessBalances(data.cashlessBalances || []);
      Notiflix.Notify.success('Saldo cashless estornado com sucesso!');
    } catch (err) {
      Notiflix.Notify.failure('Erro ao solicitar estorno.');
    }
  };



  // ─── RENDERS ─────────────────────────────────────────────────────────────

  const renderOrders = () => {
    if (loadingOrders) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#8E33FF' }} /></Box>;
    if (orders.length === 0) return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Iconify icon="carbon:ticket" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Você ainda não comprou ingressos</Typography>
        <Button variant="contained" onClick={() => navigate(paths.tickets.root)} sx={{ mt: 2, bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}>Ver eventos disponíveis</Button>
      </Box>
    );
    return (
      <Stack spacing={3}>
        {orders.map((ord) => (
          <Card key={ord._id} sx={darkCardNested}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{ord.event?.name || 'Evento Especial'}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Pedido #{ord.number} • {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    {ord.products?.map((prod: any) => (
                      <Box key={prod._id}>
                        <Box sx={{ bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 0.5, fontSize: 12, display: 'inline-block' }}>
                          {prod.quantity}x {prod.name}
                        </Box>
                        {prod.seats && prod.seats.length > 0 && (
                          <Typography variant="caption" sx={{ color: '#8E33FF', display: 'block', mt: 0.3, pl: 0.5, fontSize: 11, fontWeight: 'bold' }}>
                            Lugares: {prod.seats.map((s: string) => s.startsWith('setor_') ? 'Avulso' : s).join(', ')}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
                  <Button variant="outlined" onClick={() => setSelectedTicketForQR(ord)}
                    startIcon={<Iconify icon="carbon:qr-code" />}
                    sx={{ fontWeight: 'bold' }}>
                    Ver QR Code
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Card>
        ))}
      </Stack>
    );
  };

  const renderFavorites = () => {
    if (loadingFavorites) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#8E33FF' }} /></Box>;
    if (favorites.length === 0) return <Typography variant="body2" sx={{ color: 'text.secondary', py: 3 }}>Nenhum evento favoritado ainda.</Typography>;
    return (
      <Grid container spacing={3}>
        {favorites.map((evt) => (
          <Grid item xs={12} sm={6} md={4} key={evt._id}>
            <Card sx={{ ...darkCardNested, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(paths.tickets.event(evt._id))}>
              <CardMedia component="img" height="140" image={evt.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'} />
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{evt.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>{new Date(evt.date).toLocaleDateString('pt-BR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };



  const tabConfig = [
    { label: 'Meus Dados', icon: 'carbon:user' },
    { label: 'Meus Ingressos', icon: 'carbon:ticket' },
    { label: 'Favoritos', icon: 'carbon:favorite' },
    { label: 'Meu Cash', icon: 'carbon:wallet' },
    { label: 'Central de Ajuda', icon: 'carbon:help' },
    ...(isAdmin ? [{ label: 'Aprovação de Eventos', icon: 'carbon:checkmark-outline', admin: true }] : []),
    { label: 'Sair', icon: 'carbon:logout', danger: true },
  ];

  const logoutTabIndex = isAdmin ? 6 : 5;

  return (
    <Box sx={{ bgcolor: '#F4F5F7', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg" sx={{ textAlign: 'left' }}>
        <Grid container spacing={{ xs: 0, md: 4 }}>
          {/* Sidebar Navigation */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Card sx={{ p: 1.5, borderRadius: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)' }}>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={(_, val) => {
                  if (val === logoutTabIndex) { handleLogout(); return; }
                  setActiveTab(val);
                }}
                sx={{
                  borderRight: 0,
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: 14,
                    py: 1.5,
                    px: 2,
                    my: 0.5,
                    mx: 0,
                    borderRadius: '12px',
                    color: '#4B5563',
                    minHeight: 'auto',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: '#8E33FF',
                      bgcolor: 'rgba(142, 51, 255, 0.06)',
                    },
                    '&.Mui-selected': {
                      color: '#ffffff',
                      bgcolor: '#8E33FF',
                      boxShadow: '0 4px 12px rgba(142, 51, 255, 0.25)',
                      fontWeight: 700,
                    },
                  }
                }}
              >
                {tabConfig.map((tab: any) => (
                  <Tab
                    key={tab.label}
                    label={tab.label}
                    icon={<Iconify icon={tab.icon} width={18} sx={{ color: 'inherit' }} />}
                    iconPosition="start"
                    sx={
                      tab.danger
                        ? {
                            color: '#ff5630',
                            mt: 'auto',
                            '&:hover': {
                              color: '#ff5630',
                              bgcolor: 'rgba(255, 86, 48, 0.04)',
                            },
                            '&.Mui-selected': {
                              color: '#ff5630',
                              bgcolor: 'rgba(255, 86, 48, 0.08)',
                              borderLeft: '3px solid #ff5630',
                            },
                          }
                        : tab.admin
                        ? {
                            color: 'inherit',
                            fontWeight: 'bold',
                          }
                        : {}
                    }
                  />
                ))}
              </Tabs>
            </Card>
          </Grid>

          {/* Dynamic Panel Content */}
          <Grid item xs={12} md={9}>

            {/* Tab 0: Meus Dados */}
            {activeTab === 0 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Informações Pessoais</Typography>
                  <Box component="form" onSubmit={handleSaveProfile}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nome" value={name} onChange={(e) => setName(e.target.value)} required sx={darkInput} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="E-mail" value={email} type="email" onChange={(e) => setEmail(e.target.value)} required sx={darkInput} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="CPF" value={document} onChange={(e) => setDocument(e.target.value)} sx={darkInput} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} sx={darkInput} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Gênero" value={gender} onChange={(e) => setGender(e.target.value)} select sx={darkInput}>
                          <MenuItem value="masculino">Masculino</MenuItem>
                          <MenuItem value="feminino">Feminino</MenuItem>
                          <MenuItem value="outro">Outro</MenuItem>
                          <MenuItem value="prefiro_nao_informar">Prefiro não informar</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} sx={darkInput} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} sx={darkInput} />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Checkbox checked={hasDisability} onChange={(e) => setHasDisability(e.target.checked)} sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />}
                          label={<Typography variant="body2" sx={{ color: 'text.secondary' }}>Possuo necessidade especial / deficiência</Typography>}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant="contained" type="submit" disabled={updatingUser}
                          sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', py: 1.5, px: 4, '&:hover': { bgcolor: '#8ade00' } }}>
                          {updatingUser ? <CircularProgress size={24} sx={{ color: '#111111' }} /> : 'Salvar Alterações'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Tab 1: Meus Ingressos */}
            {activeTab === 1 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Meus Ingressos</Typography>
                  {renderOrders()}
                </Box>
              </Card>
            )}

            {/* Tab 2: Favoritos */}
            {activeTab === 2 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Eventos Favoritados</Typography>
                  {renderFavorites()}
                </Box>
              </Card>
            )}

            {/* Tab 3: Meu Cash */}
            {activeTab === 3 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>Nimbow Cashless — Meu Cash</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                    Carregue créditos antes ou durante o evento usando seu CPF. O QR Code gerado fica vinculado ao seu cartão NFC Nimbow.
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        <Button variant="contained" onClick={() => setCashlessModalOpen(true)}
                          sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', py: 1.5, '&:hover': { bgcolor: '#8ade00' } }}
                          startIcon={<Iconify icon="carbon:wallet" />}>
                          Recarregar Saldo
                        </Button>
                        <Divider />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Saldos Ativos por Evento</Typography>
                        {cashlessBalances.length === 0 ? (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Nenhum saldo ativo no momento.</Typography>
                        ) : (
                          <Stack spacing={2}>
                            {cashlessBalances.map((bal) => {
                              const evt = cashlessEvents.find((e) => e._id === bal.event);
                              return (
                                <Card key={bal.event} sx={{ ...darkCardNested, p: 2.5 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{evt?.name || 'Evento'}</Typography>
                                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8E33FF', mt: 0.5 }}>R$ {bal.balance.toFixed(2)}</Typography>
                                    </Box>
                                    <Button size="small" color="error" onClick={() => handleRefundCashless(bal.event)}>Solicitar Estorno</Button>
                                  </Box>
                                </Card>
                              );
                            })}
                          </Stack>
                        )}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>Seu QR Code de Consumo</Typography>
                        {cashlessBalances.length === 0 ? (
                          <Box sx={{ py: 4 }}>
                            <Iconify icon="carbon:qr-code" width={64} sx={{ color: 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              Recarregue créditos para gerar seu QR Code
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box component="img"
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cashlessBalances[0]?.qrCode || '')}`}
                              alt="Cashless QR" sx={{ width: 150, height: 150, mb: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }} />
                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', color: 'text.primary' }}>CPF: {document || user?.document || '—'}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Apresente este QR Code na entrada ou no ponto de venda cashless.
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            )}



            {/* Tab 4: Central de Ajuda */}
            {activeTab === 4 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>Central de Ajuda</Typography>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>Perguntas Frequentes</Typography>
                      {[
                        { q: '1. Onde encontro meus ingressos comprados?', a: 'Seus ingressos estão na aba "Meus Ingressos" desta área do cliente e também são enviados ao seu e-mail cadastrado após a compra.' },
                        { q: '2. Como funciona o reembolso do Cashless?', a: 'Se sobrar saldo cashless ao final do evento, clique em "Solicitar Estorno" na aba "Meu Cash". O valor será creditado em até 24 horas.' },
                        { q: '3. Posso alterar os dados de um ingresso já comprado?', a: 'Sim! Você pode transferir a titularidade até 24 horas antes do evento pelo nosso suporte.' },
                        { q: '4. Como criar um evento na Nimbow?', a: 'Acesse o Painel do Produtor no menu superior para criar e gerenciar seus eventos de forma profissional.' },
                        { q: '5. Quais formas de pagamento são aceitas?', a: 'Aceitamos PIX (confirmação imediata) e Cartão de Crédito em até 12x (sujeito ao valor do evento).' },
                      ].map((item) => (
                        <Box key={item.q} sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{item.q}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.7 }}>{item.a}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>Precisa de mais ajuda?</Typography>
                      <Button
                        variant="contained"
                        href="https://wa.me/5541988917885?text=Olá! Preciso de ajuda com minha conta Nimbow."
                        target="_blank"
                        startIcon={<Iconify icon="mdi:whatsapp" />}
                        sx={{ bgcolor: '#25D366', color: '#ffffff', fontWeight: 'bold', '&:hover': { bgcolor: '#22c05b' } }}
                      >
                        Falar com Suporte via WhatsApp
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            )}

            {/* Tab 5: Admin — Aprovação de Eventos */}
            {isAdmin && activeTab === 5 && (
              <Card sx={darkCard}>
                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Aprovação de Eventos</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Gerencie os eventos aguardando aprovação na plataforma Nimbow Tickets.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={`${pendingEvents.length} pendente${pendingEvents.length !== 1 ? 's' : ''}`}
                        sx={{ bgcolor: '#f59e0b', color: '#111111', fontWeight: 'bold' }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={loadPendingEvents}
                        startIcon={<Iconify icon="carbon:renew" />}
                        disabled={loadingPending}
                        sx={{ fontWeight: 'bold' }}
                      >
                        Atualizar
                      </Button>
                    </Box>
                  </Box>

                  {loadingPending ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: '#8E33FF' }} />
                    </Box>
                  ) : pendingEvents.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Iconify icon="carbon:checkmark-outline" width={64} sx={{ color: '#22c55e', mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Nenhum evento aguardando aprovação
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Todos os eventos foram revisados.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {/* Toolbar */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Categoria</InputLabel>
                          <Select
                            label="Categoria"
                            value={adminCategoryFilter}
                            onChange={(e) => {
                              setAdminCategoryFilter(e.target.value);
                              setAdminPage(1);
                              setSelectedPendingEvents([]);
                            }}
                          >
                            <MenuItem value=""><em>Todas</em></MenuItem>
                            {Array.from(new Set(pendingEvents.map(e => e.category).filter(Boolean))).map(cat => (
                              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                (() => {
                                  const filtered = pendingEvents.filter(evt => !adminCategoryFilter || evt.category === adminCategoryFilter);
                                  const paginated = filtered.slice((adminPage - 1) * adminPerPage, adminPage * adminPerPage);
                                  return paginated.length > 0 && paginated.every(evt => selectedPendingEvents.includes(evt._id));
                                })()
                              }
                              onChange={(e) => {
                                const filtered = pendingEvents.filter(evt => !adminCategoryFilter || evt.category === adminCategoryFilter);
                                const paginated = filtered.slice((adminPage - 1) * adminPerPage, adminPage * adminPerPage);
                                if (e.target.checked) {
                                  const newSelected = [...selectedPendingEvents];
                                  paginated.forEach(evt => {
                                    if (!newSelected.includes(evt._id)) newSelected.push(evt._id);
                                  });
                                  setSelectedPendingEvents(newSelected);
                                } else {
                                  setSelectedPendingEvents(selectedPendingEvents.filter(id => !paginated.some(evt => evt._id === id)));
                                }
                              }}
                            />
                          }
                          label={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>Selecionar Página Atual</Typography>}
                        />

                        {selectedPendingEvents.length > 0 && (
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDeleteEvents}
                            disabled={deletingBulkEvents}
                            startIcon={deletingBulkEvents ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="carbon:trash-can" />}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Excluir Selecionados ({selectedPendingEvents.length})
                          </Button>
                        )}
                      </Box>

                      <Stack spacing={2}>
                        {(() => {
                          const filtered = pendingEvents.filter(evt => !adminCategoryFilter || evt.category === adminCategoryFilter);
                          const paginated = filtered.slice((adminPage - 1) * adminPerPage, adminPage * adminPerPage);
                          
                          if (filtered.length === 0) {
                            return (
                              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                                Nenhum evento encontrado para a categoria selecionada.
                              </Typography>
                            );
                          }

                          return paginated.map((evt) => (
                            <Paper
                              key={evt._id}
                              sx={{
                                p: 2,
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                bgcolor: 'rgba(245, 158, 11, 0.04)',
                                borderRadius: 2,
                                transition: 'border-color 0.2s',
                                '&:hover': { borderColor: 'rgba(245, 158, 11, 0.5)' },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Checkbox
                                checked={selectedPendingEvents.includes(evt._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPendingEvents([...selectedPendingEvents, evt._id]);
                                  } else {
                                    setSelectedPendingEvents(selectedPendingEvents.filter(id => id !== evt._id));
                                  }
                                }}
                              />
                              <Grid container spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                                <Grid item xs={12} sm={2}>
                                  <Box
                                    component="img"
                                    src={evt.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80'}
                                    sx={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 1 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {evt.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                                    {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR', { dateStyle: 'long' }) : '—'}
                                    {evt.local ? ` • ${evt.local}` : ''}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    Categoria: {evt.category || '—'}
                                  </Typography>
                                  {evt.producerName && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                      Produtor: {evt.producerName}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleApproveEvent(evt._id)}
                                      disabled={approvingId === evt._id}
                                      startIcon={approvingId === evt._id
                                        ? <CircularProgress size={14} sx={{ color: '#111111' }} />
                                        : <Iconify icon="carbon:checkmark-filled" />
                                      }
                                      sx={{
                                        bgcolor: '#22c55e', color: '#ffffff', fontWeight: 'bold',
                                        '&:hover': { bgcolor: '#16a34a' },
                                      }}
                                    >
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={() => handleRejectEvent(evt._id)}
                                      disabled={approvingId === evt._id}
                                      startIcon={<Iconify icon="carbon:close-filled" />}
                                      sx={{ fontWeight: 'bold' }}
                                    >
                                      Rejeitar
                                    </Button>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Paper>
                          ));
                        })()}
                      </Stack>
                      
                      {(() => {
                        const filtered = pendingEvents.filter(evt => !adminCategoryFilter || evt.category === adminCategoryFilter);
                        const totalPages = Math.ceil(filtered.length / adminPerPage);
                        if (totalPages > 1) {
                          return (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                              <Pagination
                                count={totalPages}
                                page={adminPage}
                                onChange={(e, value) => setAdminPage(value)}
                                color="primary"
                              />
                            </Box>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                  )}
                </Box>
              </Card>
            )}

          </Grid>
        </Grid>

        {/* ─── Modals ───────────────────────────────────────────────────────── */}



        {/* Cashless Reload Modal */}
        <Dialog
          open={cashlessModalOpen}
          onClose={() => setCashlessModalOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Carregar Saldo Cashless</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField fullWidth select label="Selecione o Evento" value={selectedCashlessEvent} onChange={(e) => setSelectedCashlessEvent(e.target.value)}>
                {cashlessEvents.map((evt) => <MenuItem key={evt._id} value={evt._id}>{evt.name}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Valor da Recarga (R$)" type="number" value={cashlessLoadAmount} onChange={(e) => setCashlessLoadAmount(Number(e.target.value))} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCashlessModalOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleLoadCashlessBalance} sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}>Carregar Créditos</Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Ticket Viewer */}
        <Dialog
          open={Boolean(selectedTicketForQR)}
          onClose={() => setSelectedTicketForQR(null)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ingresso Nimbow Tickets</DialogTitle>
          {selectedTicketForQR && (
            <>
              <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <Box component="img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicketForQR._id}-${selectedTicketForQR.products?.[0]?._id || 'entry'}`}
                  alt="Ticket QR" sx={{ width: 200, height: 200, mb: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center', color: 'text.primary' }}>{selectedTicketForQR.event?.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>Pedido #{selectedTicketForQR.number}</Typography>
                <Box sx={{ bgcolor: 'action.hover', px: 2, py: 1, borderRadius: 1, width: '100%', textAlign: 'center' }}>
                  {selectedTicketForQR.products?.map((p: any) => (
                    <Box key={p._id} sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{p.quantity}x {p.name}</Typography>
                      {p.seats && p.seats.length > 0 && (
                        <Typography variant="caption" sx={{ color: '#8E33FF', fontWeight: 'bold', display: 'block' }}>
                          Lugar(es): {p.seats.map((s: string) => s.startsWith('setor_') ? 'Avulso' : s).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 3 }}>
                  Apresente este QR Code no validador da entrada do evento.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={() => setSelectedTicketForQR(null)} variant="contained" sx={{ bgcolor: '#8E33FF', color: '#ffffff', px: 4, '&:hover': { bgcolor: '#7A19E6' } }}>Fechar</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}
