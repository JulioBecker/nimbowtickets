import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Divider,
  TextField,
  Tooltip,
  Alert,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Notiflix from 'notiflix';
import SeatMapDialog from 'src/components/SeatMapDialog';
import { useUserStore } from 'src/store/user';

const DEFAULT_SECTORS_LAYOUT = [
  { id: 'stage', name: 'Palco', type: 'stage', gridRow: 1, gridCol: 2, gridRowSpan: 1, gridColSpan: 4, color: '#000000', border: '#9BEA00' },
  { id: 'front', name: 'Área VIP', type: 'sector', gridRow: 2, gridCol: 1, gridRowSpan: 1, gridColSpan: 6, color: '#FF2E5B' },
  { id: 'pista', name: 'Pista', type: 'sector', gridRow: 3, gridCol: 2, gridRowSpan: 3, gridColSpan: 4, color: '#FF7B00' },
  { id: 'bathrooms', name: 'Banheiros', type: 'bathrooms', gridRow: 3, gridCol: 1, gridRowSpan: 3, gridColSpan: 1, color: '#FFE600' },
  { id: 'food1', name: 'Alimentação', type: 'food', gridRow: 3, gridCol: 6, gridRowSpan: 2, gridColSpan: 1, color: '#007BFF' },
  { id: 'food2', name: 'Alimentação', type: 'food', gridRow: 6, gridCol: 2, gridRowSpan: 1, gridColSpan: 4, color: '#007BFF' },
];

interface ProductType {
  _id: string;
  name: string;
  price: number;
  description?: string;
  validateQrcode?: { enabled: boolean };
  startDate?: string;
  endDate?: string;
  stock?: number;
  currentStock?: number;
}

interface EventType {
  _id: string;
  name: string;
  photo?: string;
  date: string;
  local?: string;
  address?: string;
  description?: string;
  extraCost?: number;
  category?: string;
  producerName?: string;
  producerLogo?: string;
  producerDescription?: string;
  producerSlug?: string;
  mapConfig?: any;
  additionalDates?: string[];
  tax?: any;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [event, setEvent] = useState<EventType | null>(null);
  const [tickets, setTickets] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string[]>>({}); // ticketId → seatIds

  useEffect(() => {
    async function loadEventData() {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/event/${id}`);
        if (data?.event || data?._id) {
          const eventData = data?.event || data;
          setEvent(eventData);

          // Try to get products from event response first, then fetch separately
          let products = data?.products || data?.event?.products || [];

          // If no products came with event, fetch them separately
          if (!products || products.length === 0) {
            try {
              const { data: productData } = await axiosInstance.get(`/product`, {
                params: { event: id, perPage: 100 },
              });
              products = productData?.data || productData?.products || productData || [];
              if (!Array.isArray(products)) products = [];
            } catch (prodErr) {
              console.warn('Could not fetch products separately:', prodErr);
              products = [];
            }
          }

          setTickets(products);

          const eventDate = new Date(eventData.date);
          const dates = [eventDate];
          if (eventData.additionalDates && eventData.additionalDates.length > 0) {
            eventData.additionalDates.forEach((d: string) => dates.push(new Date(d)));
          }
          setAvailableDates(dates);

          const initialQuants: Record<string, number> = {};
          products.forEach((prod: ProductType) => {
            initialQuants[prod._id] = 0;
          });
          setSelectedQuantities(initialQuants);
        } else {
          setError('Evento não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar dados do evento:', err);
        setError('Erro ao carregar o evento. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [id]);

  const handleIncrement = (id: string) => {
    const ticket = tickets.find((t) => t._id === id);
    if (!ticket) return;
    const currentQty = selectedQuantities[id] || 0;
    const stockLimit = ticket.currentStock !== undefined ? ticket.currentStock : 999;

    if (currentQty < stockLimit) {
      setSelectedQuantities((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    } else {
      Notiflix.Notify.warning('Quantidade máxima disponível atingida.');
    }
  };

  const handleDecrement = (id: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'NIMBOW10') {
      setDiscountPercent(10);
      setCouponApplied(true);
      Notiflix.Notify.success('Cupom NIMBOW10 aplicado! 10% de desconto.');
    } else {
      Notiflix.Notify.failure('Cupom inválido.');
      setDiscountPercent(0);
      setCouponApplied(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Confira esse evento incrível: ${event?.name}`;
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      Notiflix.Notify.success('Link copiado para a área de transferência!');
    }
  };

  const handleBuy = async () => {
    const selectedTicketsList = tickets
      .filter((t) => selectedQuantities[t._id] > 0)
      .map((t) => ({
        ...t,
        quantity: selectedQuantities[t._id],
      }));

    if (selectedTicketsList.length === 0) {
      Notiflix.Notify.warning('Por favor, selecione pelo menos um ingresso.');
      return;
    }

    Notiflix.Loading.pulse('Reservando seus ingressos...');
    try {
      await axiosInstance.post('/product/reserve', {
        event: event?._id,
        products: selectedTicketsList.map((t) => ({
          product: t._id,
          quantity: t.quantity,
        })),
      });

      const minimizedEvent = {
        _id: event?._id,
        name: event?.name,
        producerName: event?.producerName,
        producerSlug: event?.producerSlug,
        producerLogo: event?.producerLogo,
        producerDescription: event?.producerDescription,
        tax: event?.tax,
        photo: event?.photo,
        date: event?.date,
        local: event?.local,
        address: event?.address,
      };

      const checkoutSessionData = {
        event: event?._id,
        tickets: selectedTicketsList.map((t) => ({
          _id: t._id,
          name: t.name,
          price: t.price,
          quantity: t.quantity,
        })),
        coupon: couponApplied ? coupon : '',
        discountPercent,
        selectedSeats
      };

      const { data: sessionData } = await axiosInstance.post('/product/checkout-session', checkoutSessionData);
      Notiflix.Loading.remove();

      navigate(`${paths.tickets.checkout(event?._id || '')}?sessionId=${sessionData.session._id}`, {
        state: {
          tickets: selectedTicketsList,
          coupon: couponApplied ? coupon : '',
          discountPercent,
          event: minimizedEvent,
          seats: selectedSeats
        }
      });
    } catch (err: any) {
      Notiflix.Loading.remove();
      const errMsg = err?.error || err?.message || err?.errors || 'Erro ao realizar a reserva de ingressos.';
      Notiflix.Notify.failure(errMsg);
    }
  };

  const handleSeatMapConfirm = (seats: Record<string, string[]>) => {
    setSelectedSeats(seats);
    // Seat map type is sectors — quantities managed by sectors UI directly
    setSeatMapOpen(false);
    const totalSeats = Object.values(seats).reduce((sum, arr) => sum + arr.length, 0);
    Notiflix.Notify.success(`${totalSeats} lugar(es) selecionado(s) com sucesso!`);
  };

  const producerKey = event?.producerSlug || event?.producerName || '';
  const isFollowing = user?.followingProducers?.includes(producerKey) || false;

  const handleToggleFollow = async () => {
    if (!user) {
      Notiflix.Notify.warning('Você precisa estar logado para seguir o produtor.');
      navigate(paths.auth.login);
      return;
    }

    const currentFollowing = user.followingProducers || [];
    let updatedFollowing: string[];
    if (isFollowing) {
      updatedFollowing = currentFollowing.filter((slug) => slug !== producerKey);
    } else {
      updatedFollowing = [...currentFollowing, producerKey];
    }

    try {
      Notiflix.Loading.pulse('Atualizando...');
      const { data } = await axiosInstance.put('/user/me', {
        followingProducers: updatedFollowing
      });
      setUser(data);
      Notiflix.Loading.remove();
      Notiflix.Notify.success(isFollowing ? 'Você deixou de seguir este produtor.' : 'Agora você segue este produtor!');
    } catch (err) {
      Notiflix.Loading.remove();
      Notiflix.Notify.failure('Erro ao atualizar cadastro do produtor.');
    }
  };

  const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getRows = () => {
    const maxIdx = ROW_LETTERS.indexOf((event?.mapConfig?.gridRows || 'E').toUpperCase());
    return ROW_LETTERS.slice(0, maxIdx + 1).split('');
  };

  const getTicketForSeat = (seatId: string): ProductType | undefined => {
    const ticketId = event?.mapConfig?.seatAssignments?.[seatId];
    if (!ticketId) return undefined;
    return tickets.find((t) => t._id === ticketId);
  };

  const getSeatStatus = (seatId: string): 'occupied' | 'selected' | 'assigned' | 'free' => {
    const isSelected = Object.values(selectedSeats).some((arr) => arr.includes(seatId));
    if (isSelected) return 'selected';
    if (event?.mapConfig?.seatAssignments?.[seatId]) return 'assigned';
    return 'free';
  };

  const getSeatBgColor = (seatId: string): string => {
    const status = getSeatStatus(seatId);
    if (status === 'selected') return '#9BEA00';
    if (status === 'assigned') {
      const ticketId = event?.mapConfig?.seatAssignments?.[seatId];
      if (!ticketId) return '#E5E7EB';
      const idx = tickets.findIndex((t) => t._id === ticketId);
      const colors = ['#8E33FF', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
      return `${colors[idx % colors.length]}80`;
    }
    return '#E5E7EB';
  };

  const toggleSeat = (seatId: string) => {
    const ticket = getTicketForSeat(seatId);
    if (!ticket && event?.mapConfig?.type !== 'sectors') return;

    const ticketId = ticket?._id || '';
    const isSelected = Object.values(selectedSeats).some((arr) => arr.includes(seatId));

    if (isSelected) {
      setSelectedSeats((prev) => {
        const next = { ...prev };
        if (next[ticketId]) {
          next[ticketId] = next[ticketId].filter((id) => id !== seatId);
          if (next[ticketId].length === 0) {
            delete next[ticketId];
          }
        }
        return next;
      });
      if (ticketId) {
        setSelectedQuantities((prev) => ({
          ...prev,
          [ticketId]: Math.max(0, (prev[ticketId] || 0) - 1)
        }));
      }
    } else {
      const stockLimit = ticket?.currentStock !== undefined ? ticket.currentStock : 999;
      const currentQty = selectedQuantities[ticketId] || 0;
      if (currentQty >= stockLimit) {
        Notiflix.Notify.warning('Quantidade máxima disponível atingida.');
        return;
      }

      setSelectedSeats((prev) => {
        const next = { ...prev };
        if (!next[ticketId]) {
          next[ticketId] = [];
        }
        next[ticketId].push(seatId);
        return next;
      });
      if (ticketId) {
        setSelectedQuantities((prev) => ({
          ...prev,
          [ticketId]: (prev[ticketId] || 0) + 1
        }));
      }
    }
  };

  const handleAddSectorSeat = (sector: any) => {
    const ticketId = sector.ticketId;
    const ticket = tickets.find((t) => t._id === ticketId);
    if (!ticket) return;

    const currentQty = selectedQuantities[ticketId] || 0;
    const stockLimit = ticket.currentStock !== undefined ? ticket.currentStock : 999;
    if (currentQty >= stockLimit) {
      Notiflix.Notify.warning('Quantidade máxima de ingressos atingida.');
      return;
    }

    const selectedInSector = (selectedSeats[ticketId] || []).filter((s) => s.startsWith(`setor_${sector.id}_`)).length;
    const availableInSector = sector.capacity - selectedInSector;

    if (availableInSector <= 0) {
      Notiflix.Notify.warning('Setor sem assentos adicionais disponíveis.');
      return;
    }

    const newSeatId = `setor_${sector.id}_${Date.now()}`;
    
    if (!event) return;
    if (!event.mapConfig) event.mapConfig = {};
    if (!event.mapConfig.seatAssignments) {
      event.mapConfig.seatAssignments = {};
    }
    event.mapConfig.seatAssignments[newSeatId] = ticketId;

    setSelectedSeats((prev) => {
      const next = { ...prev };
      if (!next[ticketId]) {
        next[ticketId] = [];
      }
      next[ticketId].push(newSeatId);
      return next;
    });

    setSelectedQuantities((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1
    }));
  };

  const handleRemoveSectorSeat = (sector: any) => {
    const ticketId = sector.ticketId;
    const sectorSeats = (selectedSeats[ticketId] || []).filter((s) => s.startsWith(`setor_${sector.id}_`));
    if (sectorSeats.length === 0) return;

    const toRemove = sectorSeats[sectorSeats.length - 1];

    setSelectedSeats((prev) => {
      const next = { ...prev };
      if (next[ticketId]) {
        next[ticketId] = next[ticketId].filter((s) => s !== toRemove);
        if (next[ticketId].length === 0) {
          delete next[ticketId];
        }
      }
      return next;
    });

    setSelectedQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) - 1)
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#8E33FF' }} />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>{error || 'Evento não disponível'}</Typography>
        <Button variant="contained" onClick={() => navigate(paths.tickets.root)} sx={{ bgcolor: '#8E33FF', color: '#ffffff', '&:hover': { bgcolor: '#7A19E6' } }}>
          Voltar para Home
        </Button>
      </Container>
    );
  }

  const serviceFeeRate = 0.10;
  let subtotal = 0;
  tickets.forEach((t) => {
    subtotal += t.price * (selectedQuantities[t._id] || 0);
  });
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAfterDiscount = subtotal - discountAmount;
  const serviceFee = totalAfterDiscount * serviceFeeRate;
  const grandTotal = totalAfterDiscount + serviceFee;

  return (
    <Box sx={{ pb: 8, bgcolor: '#F4F5F7' }}>
      
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

      {/* Banner Destaque */}
      <Box
        sx={{
          height: { xs: 260, md: 450 },
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${event.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mb: 6,
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          {/* Main Info */}
          <Grid item xs={12} md={7.5}>
            
            <Typography variant="caption" sx={{ color: '#7A19E6', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', mb: 1, textAlign: 'left' }}>
              {event.category || 'Shows'}
            </Typography>

            <Typography variant="h3" sx={{ fontWeight: 800, color: '#111111', mb: 3, lineHeight: 1.2, textAlign: 'left' }}>
              {event.name}
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Compartilhar:</Typography>
              <IconButton onClick={() => handleShare('whatsapp')} sx={{ bgcolor: '#25D366', color: '#ffffff', '&:hover': { opacity: 0.9 } }}>
                <Iconify icon="mdi:whatsapp" width={20} />
              </IconButton>
              <IconButton onClick={() => handleShare('facebook')} sx={{ bgcolor: '#3b5998', color: '#ffffff', '&:hover': { opacity: 0.9 } }}>
                <Iconify icon="mdi:facebook" width={20} />
              </IconButton>
              <IconButton onClick={() => handleShare('twitter')} sx={{ bgcolor: '#000000', color: '#ffffff', '&:hover': { opacity: 0.9 } }}>
                <Iconify icon="ri:twitter-x-fill" width={20} />
              </IconButton>
              <IconButton onClick={() => handleShare('copy')} sx={{ bgcolor: '#555555', color: '#ffffff', '&:hover': { opacity: 0.9 } }}>
                <Iconify icon="carbon:copy" width={20} />
              </IconButton>
            </Stack>

            <Card sx={{ p: 3, mb: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textAlign: 'left' }}>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Iconify icon="carbon:calendar" width={24} sx={{ color: '#8E33FF', mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>Data e Horário</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {new Date(event.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Abertura: {event.date ? new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '20:00'}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                <Iconify icon="carbon:map" width={24} sx={{ color: '#8E33FF', mt: 0.3 }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>Localização</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{event.local || 'A definir'}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>{event.address || ''}</Typography>
                  {event.address && event.local !== 'Online' && (
                    <Box sx={{ mt: 1.5, borderRadius: 1.5, overflow: 'hidden', height: 200, width: '100%', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <iframe
                        title="Google Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Iconify icon="carbon:purchase" width={24} sx={{ color: '#8E33FF', mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>Formas de Pagamento Aceitas</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    PIX (confirmação imediata) ou Cartão de Crédito em até 12x.
                  </Typography>
                </Box>
              </Box>

            </Card>

            {availableDates.length > 1 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#111111', textAlign: 'left' }}>Outras Datas Disponíveis</Typography>
                <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
                  {availableDates.map((dt, idx) => (
                    <Card
                      key={idx}
                      onClick={() => setActiveDateIndex(idx)}
                      sx={{
                        p: 2,
                        minWidth: 140,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        textAlign: 'center',
                        border: '2px solid',
                        borderColor: activeDateIndex === idx ? '#8E33FF' : 'transparent',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        '&:hover': { borderColor: activeDateIndex === idx ? '#8E33FF' : 'rgba(0,0,0,0.1)' }
                      }}
                    >
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
                        {dt.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: activeDateIndex === idx ? '#7A19E6' : '#111111', my: 0.5 }}>
                        {dt.getDate()}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                        {dt.toLocaleDateString('pt-BR', { month: 'short' })}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </>
            )}

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#111111', textAlign: 'left' }}>Sobre o Evento</Typography>
            <Typography variant="body1" sx={{ color: '#222222', lineHeight: 1.8, mb: 4, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
              {event.description || 'Nenhum detalhe adicional informado pelo produtor.'}
            </Typography>

            {/* Inline Seat Map Rendering */}
            {event.mapConfig?.enabled && (
              <Card id="event-seat-map" sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#111111' }}>
                  Mapa de Assentos
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                  Selecione seus assentos diretamente no mapa interativo abaixo. Eles serão vinculados automaticamente ao seu carrinho.
                </Typography>

                {/* Legend */}
                {event.mapConfig.type !== 'sectors' && (
                  <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
                    {[
                      { color: '#E5E7EB', label: 'Não disponível', opacity: 0.5 },
                      { color: '#8E33FF80', label: 'Disponível' },
                      { color: '#9BEA00', label: 'Selecionado' },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 14, height: 14, bgcolor: item.color, borderRadius: 0.5, opacity: item.opacity || 1, border: '1px solid rgba(0,0,0,0.1)' }} />
                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 11 }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}

                {/* Grid Type */}
                {event.mapConfig.type === 'grid' && (
                  <Box sx={{ overflowX: 'auto', pb: 1 }}>
                    <Box sx={{ bgcolor: '#D1D5DB', borderRadius: 1, mb: 3, py: 0.8, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', fontSize: 11 }}>
                        PALCO / TELA
                      </Typography>
                    </Box>
                    <Stack spacing={0.5}>
                      {getRows().map((row) => (
                        <Stack key={row} direction="row" spacing={0.4} alignItems="center">
                          <Typography variant="caption" sx={{ width: 18, fontWeight: 'bold', color: '#6B7280', textAlign: 'center', fontSize: 11 }}>
                            {row}
                          </Typography>
                          {Array.from({ length: Math.max(1, Math.min(30, event.mapConfig.gridCols || 8)) }, (_, colIdx) => {
                            const seatId = `${row}-${colIdx + 1}`;
                            const status = getSeatStatus(seatId);
                            const ticket = getTicketForSeat(seatId);
                            const bgcolor = getSeatBgColor(seatId);

                            return (
                              <Tooltip
                                key={seatId}
                                title={
                                  ticket
                                    ? `${row}${colIdx + 1} — ${ticket.name} (R$ ${ticket.price.toFixed(2)})`
                                    : `${row}${colIdx + 1} — Não disponível`
                                }
                                placement="top"
                              >
                                <Box
                                  onClick={() => toggleSeat(seatId)}
                                  sx={{
                                    width: { xs: 20, sm: 24 },
                                    height: { xs: 16, sm: 20 },
                                    bgcolor,
                                    borderRadius: '3px 3px 0 0',
                                    cursor: ticket ? 'pointer' : 'default',
                                    transition: 'all 0.1s',
                                    border: status === 'selected' ? '2px solid #79b800' : '1px solid rgba(0,0,0,0.1)',
                                    flexShrink: 0,
                                    opacity: status === 'free' ? 0.25 : 1,
                                    '&:hover': ticket ? { transform: 'scaleY(1.1)', opacity: 1 } : {},
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Tables Type */}
                {event.mapConfig.type === 'tables' && (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Grid container spacing={3} sx={{ p: 1 }}>
                      {Array.from({ length: Math.max(1, Math.min(20, event.mapConfig.numTables || 4)) }, (_, tIdx) => {
                        const numSeats = Math.max(2, Math.min(12, event.mapConfig.seatsPerTable || 6));
                        return (
                          <Grid item key={tIdx} xs={6} sm={4} md={3}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563', fontSize: 11 }}>
                                Mesa {tIdx + 1}
                              </Typography>
                              <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: '#F3F4F6', border: '2px solid #D1D5DB', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', fontSize: 10 }}>{tIdx + 1}</Typography>
                                </Box>
                                {Array.from({ length: numSeats }, (_, sIdx) => {
                                  const angle = (360 / numSeats) * sIdx - 90;
                                  const rad = (angle * Math.PI) / 180;
                                  const radius = 44;
                                  const x = 50 + radius * Math.cos(rad) - 8;
                                  const y = 50 + radius * Math.sin(rad) - 8;
                                  const seatId = `Mesa ${tIdx + 1}-Cad ${sIdx + 1}`;
                                  const status = getSeatStatus(seatId);
                                  const ticket = getTicketForSeat(seatId);
                                  const bgcolor = getSeatBgColor(seatId);
                                  return (
                                    <Tooltip key={sIdx} title={
                                      ticket
                                        ? `Mesa ${tIdx + 1} - Cad ${sIdx + 1} — ${ticket.name} (R$ ${ticket.price.toFixed(2)})`
                                        : `Mesa ${tIdx + 1} - Cad ${sIdx + 1} — Não disponível`
                                    }>
                                      <Box
                                        onClick={() => toggleSeat(seatId)}
                                        sx={{
                                          position: 'absolute',
                                          left: `${x}%`,
                                          top: `${y}%`,
                                          width: 16,
                                          height: 16,
                                          borderRadius: '50%',
                                          bgcolor,
                                          border: status === 'selected' ? '2px solid #79b800' : '1px solid rgba(0,0,0,0.15)',
                                          cursor: ticket ? 'pointer' : 'default',
                                          transition: 'all 0.15s',
                                          opacity: status === 'free' ? 0.25 : 1,
                                          '&:hover': ticket ? { transform: 'scale(1.3)', zIndex: 2 } : {},
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {/* Sectors Type */}
                {event.mapConfig.type === 'sectors' && (() => {
                  const sectors = event.mapConfig.sectors || [];
                  const layout = event.mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT;

                  return (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gridTemplateRows: 'repeat(6, 1fr)',
                        width: '100%',
                        maxWidth: 340,
                        mx: 'auto',
                        aspectRatio: '1/1',
                        bgcolor: '#111111',
                        borderRadius: 2,
                        p: 2,
                        gap: 1.5,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                      }}>
                        {layout.map((block: any) => {
                          const isVertical = block.gridRowSpan > block.gridColSpan;
                          
                          // Determine ticket details for sectors
                          let ticket: any = null;
                          let sectorConfig: any = null;

                          if (block.type === 'sector') {
                            if (block.sectorId) {
                              sectorConfig = sectors.find((s: any) => s.id === block.sectorId);
                            } else {
                              if (block.id === 'front') {
                                sectorConfig = sectors.find((s: any) => s.name.toLowerCase().includes('front') || s.name.toLowerCase().includes('vip'));
                              } else if (block.id === 'pista') {
                                sectorConfig = sectors.find((s: any) => s.name.toLowerCase().includes('pista'));
                              }
                            }
                            if (sectorConfig) {
                              ticket = tickets.find((t) => t._id === sectorConfig.ticketId);
                            }
                          }

                          const blockColor = sectorConfig?.color || block.color || '#6B7280';

                          return (
                            <Box 
                              key={block.id}
                              sx={{
                                gridRow: `${block.gridRow} / span ${block.gridRowSpan}`,
                                gridColumn: `${block.gridCol} / span ${block.gridColSpan}`,
                                bgcolor: blockColor,
                                borderRadius: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: block.border ? `2px solid ${block.border}` : '1px solid rgba(255,255,255,0.1)',
                                p: 0.5,
                                textAlign: 'center',
                              }}
                            >
                              <Typography sx={{ 
                                color: block.type === 'stage' ? '#ffffff' : (blockColor === '#FFE600' ? '#000000' : '#ffffff'),
                                fontWeight: 900,
                                fontSize: { xs: 8, sm: block.gridColSpan > 2 ? 13 : 9 },
                                letterSpacing: block.gridColSpan > 2 ? 2 : 1,
                                writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
                                transform: isVertical ? 'rotate(180deg)' : 'none',
                                lineHeight: 1.1,
                              }}>
                                {(sectorConfig?.name || block.name).toUpperCase()}
                              </Typography>
                              
                              {block.type === 'sector' && ticket && !isVertical && (
                                <Typography sx={{ 
                                  color: 'rgba(255,255,255,0.8)', 
                                  fontSize: { xs: 7, sm: 10 }, 
                                  mt: 0.2 
                                }}>
                                  {ticket.price === 0 ? 'Gratuito' : `R$ ${ticket.price.toFixed(2)}`}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Selected Sectors Control List removed since sectors map is visual only */}
                    </Box>
                  );
                })()}

              </Card>
            )}

            {/* Card do Produtor */}
            <Card sx={{ p: 3, mt: 4, mb: 4, borderRadius: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3, border: '1px solid rgba(142, 51, 255, 0.1)', bgcolor: 'rgba(142, 51, 255, 0.02)', textAlign: 'left' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                <Avatar
                  src={event.producerLogo || '/images/NIMBOW TICKETS - FUNDO ESCURO.png'}
                  alt={event.producerName || 'Produtor'}
                  sx={{ width: 64, height: 64, border: '2px solid #8E33FF' }}
                />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>
                    {event.producerName || 'Produtor Nimbow'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {event.producerDescription || 'Organizador verificado de grandes eventos e festivais.'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8E33FF', fontWeight: 'bold' }}>
                    Produtor Verificado
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant={isFollowing ? 'contained' : 'outlined'}
                onClick={handleToggleFollow}
                sx={{
                  flexShrink: 0,
                  bgcolor: isFollowing ? '#8E33FF' : 'transparent',
                  color: isFollowing ? '#ffffff' : '#8E33FF',
                  borderColor: '#8E33FF',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  px: 4,
                  py: 1,
                  '&:hover': {
                    bgcolor: isFollowing ? '#7A19E6' : 'rgba(142,51,255,0.05)',
                    borderColor: '#7A19E6',
                  }
                }}
              >
                {isFollowing ? 'Seguindo' : 'Seguir Produtor'}
              </Button>
            </Card>

          </Grid>

          {/* Ticket Selection Sidebar widget */}
          <Grid item xs={12} md={4.5} sx={{ alignSelf: 'flex-start' }}>
            
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', position: 'sticky', top: 90, textAlign: 'left' }}>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#111111' }}>Selecionar Ingressos</Typography>
              
              {tickets.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 3 }}>Não há ingressos cadastrados para este evento.</Alert>
              ) : (
                <Stack spacing={3} sx={{ mb: 3 }}>
                  {(() => {
                    // Helper to get base name (e.g. "Ingresso Lote 1" -> "Ingresso", "VIP - Lote 2" -> "VIP")
                    const getBaseTicketName = (name: string): string => {
                      return name.replace(/\s*[-–—]?\s*(lote|Lote)\s*\d+/i, '').trim();
                    };

                    const groupedTickets: Record<string, ProductType[]> = {};
                    tickets.forEach((t) => {
                      const baseName = getBaseTicketName(t.name);
                      if (!groupedTickets[baseName]) {
                        groupedTickets[baseName] = [];
                      }
                      groupedTickets[baseName].push(t);
                    });

                    const filteredTickets: ProductType[] = [];
                    Object.keys(groupedTickets).forEach((baseName) => {
                      const group = groupedTickets[baseName];
                      // Sort by price ascending
                      group.sort((a, b) => a.price - b.price);

                      // Find first that is not ended and not sold out
                      let active = group.find((t) => {
                        const now = new Date();
                        const endDate = t.endDate ? new Date(t.endDate) : null;
                        const isEnded = endDate && now > endDate;
                        const isSoldOut = t.currentStock !== undefined && t.currentStock <= 0;
                        return !isEnded && !isSoldOut;
                      });

                      // Fallback to the last ticket of the group if all are sold out/ended
                      if (!active && group.length > 0) {
                        active = group[group.length - 1];
                      }

                      if (active) {
                        filteredTickets.push(active);
                      }
                    });

                    return filteredTickets.map((t) => {
                      const now = new Date();
                      const startDate = t.startDate ? new Date(t.startDate) : null;
                      const endDate = t.endDate ? new Date(t.endDate) : null;
                      
                      let saleStatus: 'upcoming' | 'ended' | 'active' = 'active';
                      if (startDate && now < startDate) {
                        saleStatus = 'upcoming';
                      } else if (endDate && now > endDate) {
                        saleStatus = 'ended';
                      }

                      // Adjust status if active but sold out
                      const isSoldOut = t.currentStock !== undefined && t.currentStock <= 0;
                      const isSelectable = saleStatus === 'active' && !isSoldOut;

                      return (
                        <Box key={t._id} sx={{ opacity: isSelectable ? 1 : 0.6 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ pr: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{t.name}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 13 }}>
                                {t.price === 0 ? 'Gratuito' : `R$ ${t.price.toFixed(2)}`}
                              </Typography>
                              {isSoldOut ? (
                                <Chip
                                  size="small"
                                  label="Esgotado"
                                  color="error"
                                  sx={{ mt: 0.5, fontSize: 10, height: 18, fontWeight: 'bold' }}
                                />
                              ) : !isSelectable && (
                                <Chip
                                  size="small"
                                  label={saleStatus === 'upcoming' ? 'Vendas não iniciadas' : 'Lote encerrado'}
                                  color={saleStatus === 'upcoming' ? 'info' : 'error'}
                                  sx={{ mt: 0.5, fontSize: 10, height: 18, fontWeight: 'bold' }}
                                />
                              )}
                              {saleStatus === 'upcoming' && startDate && !isSoldOut && (
                                <Typography variant="caption" sx={{ display: 'block', color: 'info.main', fontSize: 11, mt: 0.2 }}>
                                  Começa em: {startDate.toLocaleDateString('pt-BR')} às {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              )}
                            </Box>
                            
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleDecrement(t._id)}
                                disabled={!isSelectable}
                                sx={{ border: '1px solid rgba(0,0,0,0.1)' }}
                              >
                                <Iconify icon="carbon:subtract" width={16} />
                              </IconButton>
                              <Typography sx={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                                {selectedQuantities[t._id] || 0}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleIncrement(t._id)}
                                disabled={!isSelectable}
                                sx={{ border: '1px solid rgba(0,0,0,0.1)' }}
                              >
                                <Iconify icon="carbon:add" width={16} />
                              </IconButton>
                            </Stack>
                          </Box>
                          {t.description && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                              {t.description}
                            </Typography>
                          )}
                          <Divider />
                        </Box>
                      );
                    });
                  })()}

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cupom de Desconto"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      disabled={couponApplied}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !coupon}
                      sx={{ bgcolor: '#8E33FF', color: '#ffffff', '&:hover': { bgcolor: '#7A19E6' } }}
                    >
                      Aplicar
                    </Button>
                  </Stack>

                  {subtotal > 0 && (
                    <Box sx={{ bgcolor: 'rgba(142, 51, 255, 0.05)', p: 2, borderRadius: 1, border: '1px dashed #8E33FF' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {subtotal.toFixed(2)}</Typography>
                      </Box>
                      {discountAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#ff5630' }}>
                          <Typography variant="body2">Desconto:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>- R$ {discountAmount.toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="body2">Taxa de Serviço (10%):</Typography>
                          <Tooltip title="A taxa de serviço é cobrada para cobrir os custos operacionais, processamento financeiro do pedido e suporte de segurança de dados.">
                            <IconButton size="small" sx={{ p: 0 }}>
                              <Iconify icon="carbon:help" width={14} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {serviceFee.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#7A19E6' }}>R$ {grandTotal.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Seat Map button — shown when event has a configured map */}
                  {event.mapConfig?.enabled && (event.mapConfig.type === 'grid' || event.mapConfig.type === 'tables') && (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        const el = document.getElementById('event-seat-map');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      startIcon={<Iconify icon="carbon:area-custom" />}
                      sx={{
                        borderColor: '#8E33FF',
                        color: '#8E33FF',
                        fontWeight: 'bold',
                        py: 1.5,
                        mb: 1.5,
                        '&:hover': { borderColor: '#7A19E6', bgcolor: 'rgba(142,51,255,0.05)' },
                      }}
                    >
                      Selecionar no Mapa de Assentos
                    </Button>
                  )}

                  {/* Seat summary chips */}
                  {Object.keys(selectedSeats).length > 0 && (
                    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'rgba(155,234,0,0.08)', borderRadius: 1.5, border: '1px dashed #9BEA00' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5a8a00', display: 'block', mb: 0.5 }}>
                        Lugares selecionados:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                        {Object.entries(selectedSeats).flatMap(([_tId, seats]) =>
                          seats.slice(0, 6).map((s) => (
                            <Chip key={s} label={s.startsWith('setor_') ? 'Lugar avulso' : s} size="small" sx={{ fontSize: 10, bgcolor: 'rgba(155,234,0,0.2)', color: '#5a8a00', fontWeight: 'bold' }} />
                          ))
                        )}
                        {Object.values(selectedSeats).flat().length > 6 && (
                          <Chip label={`+${Object.values(selectedSeats).flat().length - 6} mais`} size="small" sx={{ fontSize: 10, bgcolor: '#E5E7EB', color: '#6B7280' }} />
                        )}
                      </Stack>
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleBuy}
                    sx={{
                      bgcolor: '#9BEA00',
                      color: '#111111',
                      fontWeight: 'bold',
                      py: 1.8,
                      fontSize: 16,
                      '&:hover': { bgcolor: '#8ade00' }
                    }}
                  >
                    Comprar Ingresso
                  </Button>

                  <Stack spacing={1} sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                      <Iconify icon="carbon:security" sx={{ color: '#22c55e' }} />
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111' }}>Compra 100% Segura e Criptografada</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: 10 }}>
                      Os ingressos comprados são vinculados diretamente ao CPF e disponibilizados imediatamente após a confirmação.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1 }}>
                      <Iconify icon="logos:visa" width={32} />
                      <Iconify icon="logos:mastercard" width={32} />
                      <Iconify icon="logos:elo" width={32} />
                      <Iconify icon="logos:pix" width={32} />
                    </Box>
                  </Stack>

                </Stack>
              )}

              <Button
                fullWidth
                variant="outlined"
                href="https://wa.me/5541988917885?text=Olá! Preciso de ajuda com a compra de ingressos para o evento."
                target="_blank"
                startIcon={<Iconify icon="mdi:whatsapp" />}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  borderColor: '#25D366',
                  color: '#25D366',
                  '&:hover': { borderColor: '#22c05b', bgcolor: 'rgba(37, 211, 102, 0.05)' }
                }}
              >
                Precisa de ajuda? Fale conosco
              </Button>

            </Card>

          </Grid>

        </Grid>
      </Container>

      {/* Seat Map Dialog */}
      {event.mapConfig?.enabled && (
        <SeatMapDialog
          open={seatMapOpen}
          onClose={() => setSeatMapOpen(false)}
          mapConfig={event.mapConfig}
          tickets={tickets}
          occupiedSeats={[]}
          onConfirm={handleSeatMapConfirm}
        />
      )}
    </Box>
  );
}
