import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  Tab,
  Tabs,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useUserStore } from 'src/store/user';
import { useAuthStore } from 'src/store/auth';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Notiflix from 'notiflix';
import { masks } from 'src/utils/masks';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: eventId } = useParams<{ id: string }>();
  
  const { user, setUser } = useUserStore();
  const { setToken } = useAuthStore();

  const [event, setEvent] = useState<any>(null);
  const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const [timeLeft, setTimeLeft] = useState(900);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef<any>(null);

  const [followingProducer, setFollowingProducer] = useState(false);
  const [openContactProducer, setOpenContactProducer] = useState(false);
  const [producerMessage, setProducerMessage] = useState('');

  const [authTab, setAuthTab] = useState(0);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCPF, setAuthCPF] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [buyerName, setBuyerName] = useState(user?.name?.split(' ')[0] || '');
  const [buyerSurname, setBuyerSurname] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerConfirmEmail, setBuyerConfirmEmail] = useState(user?.email || '');
  const [buyerCPF, setBuyerCPF] = useState('');
  const [buyerGender, setBuyerGender] = useState('masculino');
  const [buyerBirthDate, setBuyerBirthDate] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerCEP, setBuyerCEP] = useState('');
  const [buyerDisability, setBuyerDisability] = useState(false);

  const [buyForAnother, setBuyForAnother] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeSurname, setAttendeeSurname] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeCPF, setAttendeeCPF] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardInstallments, setCardInstallments] = useState(1);
  const [showCVV, setShowCVV] = useState(false);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderDetails, setCreatedOrderDetails] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const initCheckout = async () => {
      try {
        let checkoutEvent = null;
        let checkoutTickets = null;
        let checkoutDiscount = 0;
        let checkoutCoupon = '';
        let checkoutSeats = {};

        const stateData = location.state as any;
        if (stateData && stateData.tickets && stateData.event) {
          checkoutEvent = stateData.event;
          checkoutTickets = stateData.tickets;
          checkoutDiscount = stateData.discountPercent || 0;
          checkoutCoupon = stateData.coupon || '';
          checkoutSeats = stateData.seats || {};

          setEvent(checkoutEvent);
          setSelectedTickets(checkoutTickets);
          setDiscountPercent(checkoutDiscount);
          setCouponCode(checkoutCoupon);
          setSelectedSeats(checkoutSeats);
        } else {
          // Fetch from backend using sessionId query param
          const searchParams = new URLSearchParams(location.search);
          const sessionId = searchParams.get('sessionId');

          if (sessionId) {
            Notiflix.Loading.pulse('Carregando informações do pedido...');
            try {
              const { data } = await axiosInstance.get(`/product/checkout-session/${sessionId}`);
              if (data && data.session) {
                const { session } = data;
                setEvent(session.event);
                setSelectedTickets(session.tickets || []);
                setDiscountPercent(session.discountPercent || 0);
                setCouponCode(session.coupon || '');
                setSelectedSeats(session.selectedSeats || {});
              } else {
                Notiflix.Notify.warning('Sua sessão expirou ou o carrinho está vazio.');
                navigate(paths.tickets.root);
              }
            } catch (fetchErr) {
              console.error('Error fetching checkout session:', fetchErr);
              Notiflix.Notify.warning('Sua sessão expirou ou o carrinho está vazio.');
              navigate(paths.tickets.root);
            } finally {
              Notiflix.Loading.remove();
            }
          } else {
            Notiflix.Notify.warning('Sua sessão expirou ou o carrinho está vazio.');
            navigate(paths.tickets.root);
          }
        }
      } catch (err) {
        console.error(err);
        navigate(paths.tickets.root);
      }
    };

    initCheckout();
  }, [navigate, location.state, location.search]);

  useEffect(() => {
    if (user && event) {
      const producerKey = event.producerSlug || event.producerName || '';
      setFollowingProducer(user.followingProducers?.includes(producerKey) || false);
    }
  }, [user, event]);

  const handleToggleFollowProducer = async () => {
    if (!user) {
      Notiflix.Notify.warning('Você precisa estar logado para seguir o produtor.');
      return;
    }
    const producerKey = event.producerSlug || event.producerName || '';
    const currentFollowing = user.followingProducers || [];
    let updatedFollowing: string[];
    const isCurrentlyFollowing = followingProducer;

    if (isCurrentlyFollowing) {
      updatedFollowing = currentFollowing.filter((slug: string) => slug !== producerKey);
    } else {
      updatedFollowing = [...currentFollowing, producerKey];
    }

    try {
      Notiflix.Loading.pulse('Atualizando...');
      const { data } = await axiosInstance.put('/user/me', {
        followingProducers: updatedFollowing
      });
      setUser(data);
      setFollowingProducer(!isCurrentlyFollowing);
      Notiflix.Loading.remove();
      Notiflix.Notify.success(!isCurrentlyFollowing ? 'Você agora segue este produtor!' : 'Deixou de seguir o produtor');
    } catch (err) {
      Notiflix.Loading.remove();
      Notiflix.Notify.failure('Erro ao atualizar cadastro do produtor.');
    }
  };

  useEffect(() => {
    if (orderSuccess) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderSuccess]);

  useEffect(() => {
    if (user) {
      setBuyerName(user.name?.split(' ')[0] || '');
      setBuyerSurname(user.name?.split(' ').slice(1).join(' ') || '');
      setBuyerEmail(user.email || '');
      setBuyerConfirmEmail(user.email || '');
      if (user.phone) setBuyerPhone(user.phone);
      if (user.cep) setBuyerCEP(user.cep);
      if (user.document) setBuyerCPF(user.document);
      if (user.gender) setBuyerGender(user.gender);
      if (user.hasDisability !== undefined) setBuyerDisability(user.hasDisability);
      if (user.birthDate) {
        try {
          const dateObj = new Date(user.birthDate);
          if (!isNaN(dateObj.getTime())) {
            const formattedDate = dateObj.toISOString().split('T')[0];
            setBuyerBirthDate(formattedDate);
          }
        } catch (e) {
          console.error('Error formatting user birthDate:', e);
        }
      }
    }
  }, [user]);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      Notiflix.Notify.failure('E-mail e senha são obrigatórios.');
      return;
    }
    setAuthLoading(true);
    try {
      const { data } = await axiosInstance.post('/user/login', { email: authEmail, password: authPassword });
      setToken(data.token);
      setUser(data.user);
      Notiflix.Notify.success('Login efetuado com sucesso!');
    } catch (err: any) {
      Notiflix.Notify.failure(err?.message || 'Falha no login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName || !authCPF) {
      Notiflix.Notify.failure('Preencha todos os campos obrigatórios.');
      return;
    }
    const cleanCPF = authCPF.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      Notiflix.Notify.warning('Digite um CPF válido com 11 dígitos.');
      return;
    }
    if (authPassword.length < 6 || !/[A-Z]/.test(authPassword) || !/[0-9]/.test(authPassword)) {
      Notiflix.Notify.warning('A senha deve ter no mínimo 6 caracteres, conter pelo menos uma letra maiúscula e um número.');
      return;
    }
    setAuthLoading(true);
    try {
      await axiosInstance.post('/user/register', { name: authName, email: authEmail, password: authPassword, document: authCPF });
      const { data } = await axiosInstance.post('/user/login', { email: authEmail, password: authPassword });
      setToken(data.token);
      setUser(data.user);
      Notiflix.Notify.success('Cadastro realizado com sucesso!');
    } catch (err: any) {
      Notiflix.Notify.failure(err?.response?.data?.error || err?.message || 'Falha no cadastro');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136d8174b2c-63b7-4a00-ba5d-63f85efb15095204000053039865406100.005802BR5914NimbowTickets6009Curitiba62070503***6304D17C');
    setPixKeyCopied(true);
    Notiflix.Notify.success('Chave Copia e Cola PIX copiada!');
  };

  const handleContactProducer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerMessage) return;
    Notiflix.Notify.success('Mensagem enviada com sucesso ao produtor!');
    setOpenContactProducer(false);
    setProducerMessage('');
  };

  const handleCompletePurchase = async () => {
    if (!buyerCPF || !buyerPhone || !buyerBirthDate) {
      Notiflix.Notify.failure('Por favor, preencha os campos obrigatórios do comprador.');
      return;
    }
    if (buyerEmail !== buyerConfirmEmail) {
      Notiflix.Notify.failure('A confirmação do e-mail não confere.');
      return;
    }
    if (buyForAnother && (!attendeeName || !attendeeEmail || !attendeeCPF)) {
      Notiflix.Notify.failure('Por favor, preencha os dados do participante.');
      return;
    }

    if (paymentMethod === 'credit' && (!cardNumber || !cardHolder || !cardExpiry || !cardCVV)) {
      Notiflix.Notify.failure('Por favor, preencha todos os dados do cartão de crédito.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderData = {
        event: event._id,
        paymentType: paymentMethod,
        total: grandTotal,
        products: selectedTickets.map((t) => ({
          _id: t._id,
          name: t.name,
          quantity: t.quantity,
          price: t.price,
          validateQrcode: { enabled: true },
          seats: selectedSeats[t._id] || [],
        })),
        observation: buyForAnother ? `Participante: ${attendeeName} (${attendeeEmail})` : 'Comprador é o participante',
        seats: selectedSeats,
        buyerInfo: {
          name: `${buyerName} ${buyerSurname}`.trim(),
          email: buyerEmail,
          cpf: buyerCPF,
          phone: buyerPhone,
          birthDate: buyerBirthDate,
          gender: buyerGender,
          disability: buyerDisability,
          cep: buyerCEP,
          buyForAnother,
          attendeeName,
          attendeeEmail,
          attendeeCPF
        }
      };

      const { data } = await axiosInstance.post('/order', orderData);
      
      setCreatedOrderDetails(data);
      setOrderSuccess(true);
      Notiflix.Notify.success('Pedido finalizado com sucesso!');

      if (user) {
        const updatedUser = {
          ...user,
          document: buyerCPF,
          phone: buyerPhone,
          gender: buyerGender,
          birthDate: buyerBirthDate,
          cep: buyerCEP,
          hasDisability: buyerDisability,
        };
        setUser(updatedUser);
      }

      console.log(`[EMAIL SIMULATOR] Ingresso enviado para ${buyerEmail}`);
    } catch (err: any) {
      console.error('Erro ao processar pedido.');
      Notiflix.Notify.failure(err?.error || err?.message || err?.errors || 'Ocorreu um erro ao processar o seu pedido.');
    } finally {
      // Clear sensitive credit card details from memory/RAM immediately
      setCardHolder('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setSubmittingOrder(false);
    }
  };

  let subtotal = 0;
  selectedTickets.forEach((t) => {
    subtotal += t.price * t.quantity;
  });
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const serviceFeeRate = 0.10;
  const serviceFee = totalAfterDiscount * serviceFeeRate;
  const grandTotal = totalAfterDiscount + serviceFee;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F5F7' }}>
        <CircularProgress sx={{ color: '#8E33FF' }} />
      </Box>
    );
  }

  if (orderSuccess && createdOrderDetails) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ bgcolor: 'rgba(142, 51, 255, 0.1)', p: 3, borderRadius: '50%' }}>
            <Iconify icon="carbon:checkmark-filled" width={80} height={80} sx={{ color: '#8E33FF' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>Compra Realizada!</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600 }}>
            Seu pedido **#{createdOrderDetails.number}** foi processado. O ingresso em PDF foi enviado para o e-mail **{buyerEmail}** e já está disponível em sua conta.
          </Typography>

          <Card sx={{ p: 4, width: '100%', maxWidth: 500, my: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Resumo do Pedido</Typography>
            <Stack spacing={1.5} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Evento:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{event.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Código do Pedido:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>#{createdOrderDetails.number}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Pago:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7A19E6' }}>R$ {grandTotal.toFixed(2)}</Typography>
              </Box>
            </Stack>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              onClick={() => navigate(paths.dashboard.root)}
              sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', py: 1.5, px: 4, '&:hover': { bgcolor: '#8ade00' } }}
            >
              Ir para Meus Ingressos
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(paths.tickets.root)}
              sx={{ color: '#111111', borderColor: '#111111', py: 1.5, px: 4 }}
            >
              Voltar ao Início
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8, bgcolor: '#F4F5F7', minHeight: '100vh' }}>
      {/* Header Minimalista */}
      <Box sx={{ bgcolor: '#111111', py: { xs: 1.5, md: 2 }, display: 'flex', justifyContent: 'center', borderBottom: '2px solid #9BEA00' }}>
        <Box
          component="img"
          src="/images/NIMBOW TICKETS - FUNDO ESCURO.png"
          alt="Nimbow"
          onClick={() => navigate(paths.tickets.root)}
          sx={{ height: { xs: 26, md: 36 }, cursor: 'pointer', objectFit: 'contain' }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'left' }}>
      
      <Card sx={{ bgcolor: 'rgba(142, 51, 255, 0.06)', color: '#111111', p: 2, mb: 4, borderRadius: 1.5, borderLeft: '6px solid #8E33FF' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="carbon:alarm" sx={{ color: '#8E33FF' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Finalize sua compra! Seus ingressos estão reservados.
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#8E33FF' }}>
            {formatTime(timeLeft)}
          </Typography>
        </Stack>
      </Card>

      <Grid container spacing={4}>
        
        {/* Left Side: Forms */}
        <Grid item xs={12} md={7.5}>
          
          {!user ? (
            <Card sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Para continuar, faça login ou cadastre-se
              </Typography>
              
              <Tabs value={authTab} onChange={(_, val) => setAuthTab(val)} sx={{ mb: 3 }}>
                <Tab label="Entrar" />
                <Tab label="Criar Conta" />
              </Tabs>

              {authTab === 0 ? (
                <Box component="form" onSubmit={handleGuestLogin}>
                  <Stack spacing={2.5}>
                    <TextField fullWidth label="E-mail" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                    <TextField fullWidth type="password" label="Senha" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={authLoading}
                      sx={{ bgcolor: '#8E33FF', color: '#ffffff', py: 1.5, '&:hover': { bgcolor: '#7A19E6' } }}
                    >
                      {authLoading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Entrar'}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleGuestRegister}>
                  <Stack spacing={2.5}>
                    <TextField fullWidth label="Nome Completo" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                    <TextField fullWidth label="E-mail" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" required />
                    <TextField fullWidth label="CPF" value={authCPF} onChange={(e) => setAuthCPF(masks.cpf(e.target.value))} required />
                    <TextField fullWidth type="password" label="Senha" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={authLoading}
                      sx={{ bgcolor: '#9BEA00', color: '#111111', py: 1.5, fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}
                    >
                      {authLoading ? <CircularProgress size={24} sx={{ color: '#111111' }} /> : 'Criar Conta'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Card>
          ) : (
            <>
              <Card sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Informações do Comprador
                </Typography>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Nome" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Sobrenome" value={buyerSurname} onChange={(e) => setBuyerSurname(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="E-mail" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Confirmar E-mail" value={buyerConfirmEmail} onChange={(e) => setBuyerConfirmEmail(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="CPF" value={buyerCPF} onChange={(e) => setBuyerCPF(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Telefone" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Gênero" value={buyerGender} onChange={(e) => setBuyerGender(e.target.value)} select>
                      <MenuItem value="masculino">Masculino</MenuItem>
                      <MenuItem value="feminino">Feminino</MenuItem>
                      <MenuItem value="outro">Outro</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Data de Nascimento" type="date" InputLabelProps={{ shrink: true }} value={buyerBirthDate} onChange={(e) => setBuyerBirthDate(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="CEP" value={buyerCEP} onChange={(e) => setBuyerCEP(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox checked={buyerDisability} onChange={(e) => setBuyerDisability(e.target.checked)} />}
                      label="Possui alguma necessidade especial/deficiência?"
                    />
                  </Grid>
                </Grid>
              </Card>

              <Card sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <FormControlLabel
                  control={<Checkbox checked={buyForAnother} onChange={(e) => setBuyForAnother(e.target.checked)} />}
                  label={<Typography sx={{ fontWeight: 'bold' }}>Quero comprar para outra pessoa</Typography>}
                />

                {buyForAnother && (
                  <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nome do Participante" value={attendeeName} onChange={(e) => setAttendeeName(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Sobrenome do Participante" value={attendeeSurname} onChange={(e) => setAttendeeSurname(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="E-mail do Participante" value={attendeeEmail} onChange={(e) => setAttendeeEmail(e.target.value)} required />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="CPF do Participante" value={attendeeCPF} onChange={(e) => setAttendeeCPF(e.target.value)} required />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Card>

              <Card sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Método de Pagamento
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 4 }}>
                  <RadioGroup row value={paymentMethod} onChange={(e: any) => setPaymentMethod(e.target.value)}>
                    <FormControlLabel value="pix" control={<Radio sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />} label="PIX (Confirmação Imediata)" />
                    <FormControlLabel value="credit" control={<Radio sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />} label="Cartão de Crédito" />
                  </RadioGroup>
                </FormControl>

                {paymentMethod === 'pix' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f9f9f9', borderRadius: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Escaneie o QR Code abaixo para pagar via Pix</Typography>
                    
                    <Box
                      component="img"
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020126580014BR.GOV.BCB.PIX0136d8174b2c-63b7-4a00-ba5d-63f85efb15095204000053039865406100.005802BR5914NimbowTickets6009Curitiba62070503***6304D17C"
                      alt="Pix QR Code"
                      sx={{ height: 180, width: 180, mb: 3, mx: 'auto', display: 'block' }}
                    />

                    <Button
                      variant="outlined"
                      onClick={handleCopyPixKey}
                      startIcon={<Iconify icon="carbon:copy" />}
                      sx={{ color: '#111111', borderColor: '#111111', fontWeight: 'bold', textTransform: 'none', px: 3 }}
                    >
                      {pixKeyCopied ? 'Copiado!' : 'Copiar Chave Copia e Cola'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Nome Impresso no Cartão"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          required
                          inputProps={{ maxLength: 50, autoComplete: 'cc-name' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Número do Cartão"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(masks.creditCard(e.target.value))}
                          required
                          inputProps={{ maxLength: 19, autoComplete: 'cc-number' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Validade (MM/AA)"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(masks.creditCardDate(e.target.value))}
                          required
                          placeholder="MM/AA"
                          inputProps={{ maxLength: 5, autoComplete: 'cc-exp' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Código de Segurança (CVV)"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(masks.cvv(e.target.value))}
                          required
                          type={showCVV ? 'text' : 'password'}
                          inputProps={{ maxLength: 4, autoComplete: 'cc-csc' }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowCVV(!showCVV)} edge="end">
                                  <Iconify icon={showCVV ? 'carbon:view' : 'carbon:view-off'} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          select
                          label="Opções de Parcelamento"
                          value={cardInstallments}
                          onChange={(e: any) => setCardInstallments(e.target.value)}
                        >
                          <MenuItem value={1}>1x de R$ {grandTotal.toFixed(2)} (Sem Juros)</MenuItem>
                          <MenuItem value={2}>2x de R$ {(grandTotal / 2).toFixed(2)} (Sem Juros)</MenuItem>
                          <MenuItem value={3}>3x de R$ {(grandTotal / 3).toFixed(2)} (Sem Juros)</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Card>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCompletePurchase}
                disabled={submittingOrder}
                sx={{
                  bgcolor: '#9BEA00',
                  color: '#111111',
                  fontWeight: 'bold',
                  py: 2,
                  fontSize: 16,
                  '&:hover': { bgcolor: '#8ade00' }
                }}
              >
                {submittingOrder ? <CircularProgress size={24} sx={{ color: '#111111' }} /> : 'Finalizar Pedido'}
              </Button>
            </>
          )}

        </Grid>

        {/* Right Side: Order summary & Producer Card */}
        <Grid item xs={12} md={4.5}>
          
          <Card sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Resumo da Compra</Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Box
                component="img"
                src={event.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'}
                alt={event.name}
                sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', lineHeight: 1.2 }}>{event.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                  {new Date(event.date).toLocaleDateString('pt-BR')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {event.local?.split(',')[0]}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {selectedTickets.map((t) => {
                const tSeats = selectedSeats[t._id] || [];
                return (
                  <Box key={t._id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t.quantity}x {t.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        R$ {(t.price * t.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    {tSeats.length > 0 && (
                      <Typography variant="caption" sx={{ color: '#8E33FF', display: 'block', mt: 0.3, pl: 0.5, fontSize: 11 }}>
                        Lugares: {tSeats.map((s) => s.startsWith('setor_') ? 'Avulso' : s).join(', ')}
                      </Typography>
                    )}
                  </Box>
                );
              })}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Taxa de Serviço (10%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {serviceFee.toFixed(2)}</Typography>
              </Box>

              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#ff5630' }}>
                  <Typography variant="body2">Desconto ({couponCode}):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>- R$ {discountAmount.toFixed(2)}</Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A19E6' }}>R$ {grandTotal.toFixed(2)}</Typography>
            </Box>
          </Card>

          <Card sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
              <Avatar
                src={event.producerLogo || '/images/NIMBOW TICKETS - FUNDO ESCURO.png'}
                alt={event.producerName || 'Produtor Nimbow'}
                sx={{ width: 50, height: 50, bgcolor: '#8E33FF' }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {event.producerName || 'Nimbow Produções'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Produtor Verificado
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.5 }}>
              {event.producerDescription || 'Organizador de festivais e eventos de alto padrão tecnológico com integração total de bilheteria e cashless Nimbow.'}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant={followingProducer ? 'contained' : 'outlined'}
                onClick={handleToggleFollowProducer}
                sx={{
                  bgcolor: followingProducer ? '#8E33FF' : 'transparent',
                  color: followingProducer ? '#ffffff' : '#111111',
                  borderColor: followingProducer ? '#8E33FF' : '#111111',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {followingProducer ? 'Seguindo' : 'Seguir Produtor'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setOpenContactProducer(true)}
                startIcon={<Iconify icon="carbon:email" />}
                sx={{ color: '#111111', textTransform: 'none', fontWeight: 'bold' }}
              >
                Falar com o Produtor
              </Button>
            </Stack>
          </Card>

        </Grid>

      </Grid>

      <Dialog open={timerExpired} disableEscapeKeyDown>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ff5630', textAlign: 'center' }}>Sua Sessão Expirou!</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
            O tempo de 15 minutos limite para reservar os seus ingressos acabou. Por favor, reinicie a seleção de ingressos na página do evento.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate(paths.tickets.event(eventId || ''))}
            sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', px: 4, '&:hover': { bgcolor: '#8ade00' } }}
          >
            Recomeçar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openContactProducer} onClose={() => setOpenContactProducer(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Falar com o Produtor</DialogTitle>
        <Box component="form" onSubmit={handleContactProducer}>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Escreva sua mensagem..."
              value={producerMessage}
              onChange={(e) => setProducerMessage(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenContactProducer(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button
              variant="contained"
              type="submit"
              sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}
            >
              Enviar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

    </Container>
    </Box>
  );
}
