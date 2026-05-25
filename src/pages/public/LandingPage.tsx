import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Chip
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Brands from 'src/components/Brands';
import CashlessBanner from 'src/components/CashlessBanner';
import { useLanguageStore } from 'src/store/useLanguageStore';

interface EventType {
  _id: string;
  name: string;
  photo?: string;
  date: string;
  local?: string;
  category?: string;
  description?: string;
  extraCost?: number;
  lowestPrice?: number;
}

const categoriesList = [
  { name: 'Eletrônico', icon: 'mdi:lightning-bolt', slug: 'eletronico' },
  { name: 'Rock', icon: 'mdi:guitar-electric', slug: 'rock' },
  { name: 'Pop', icon: 'mdi:microphone', slug: 'pop' },
  { name: 'MPB', icon: 'mdi:music-clef-treble', slug: 'mpb' },
  { name: 'Sertanejo', icon: 'mdi:account-cowboy-hat', slug: 'sertanejo' },
  { name: 'Comédia', icon: 'mdi:drama-masks', slug: 'comedia' },
];

const mockEvents: EventType[] = [
  {
    _id: 'mock1',
    name: 'Tomorrowland Brasil',
    photo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    date: '2025-09-09T16:00:00.000Z',
    local: 'Parque Maeda, Itu, SP',
    category: 'Eletrônico',
    description: 'Magical Kingdom Returns',
    extraCost: 680
  },
  {
    _id: 'mock2',
    name: 'Festival de Jazz SP',
    photo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    date: '2025-07-02T19:00:00.000Z',
    local: 'Auditório Ibirapuera, São Paulo, SP',
    category: 'Jazz',
    extraCost: 180
  },
  {
    _id: 'mock3',
    name: 'Stand Up Comedy Night',
    photo: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80',
    date: '2025-06-12T20:00:00.000Z',
    local: 'Teatro Sesc Pinheiros, São Paulo, SP',
    category: 'Comédia',
    extraCost: 90
  },
  {
    _id: 'mock4',
    name: 'Samba no Maracanã',
    photo: 'https://images.unsplash.com/photo-1533174000220-4fa028d8f0ce?auto=format&fit=crop&w=1200&q=80',
    date: '2025-10-22T14:00:00.000Z',
    local: 'Maracanã, Rio de Janeiro, RJ',
    category: 'Samba',
    extraCost: 220
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: any) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    if (touchStart === null) return;
    const touchEnd = e.targetTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      // Swipe left
      setCarouselIndex((prev) => (prev + 1) % Math.min(events.length, 5));
      setTouchStart(null);
    } else if (distance < -swipeThreshold) {
      // Swipe right
      setCarouselIndex((prev) => (prev - 1 + Math.min(events.length, 5)) % Math.min(events.length, 5));
      setTouchStart(null);
    }
  };

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data } = await axiosInstance.get('/event', {
          params: { active: 'true', perPage: 12 }
        });
        if (data?.data && data.data.length > 0) {
          setEvents(data.data);
        } else {
          setEvents(mockEvents);
        }
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    let interval: any;
    if (events.length > 1) {
      interval = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % events.length);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [events]);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`${paths.tickets.search}?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#8E33FF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 0, bgcolor: '#ffffff' }}>
      
      {/* 1. Carrossel de Imagens (Banners Full Width) */}
      <Box 
        sx={{ position: 'relative', width: '100%', height: { xs: 400, md: 600 }, overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {events.slice(0, 5).map((evt, idx) => (
          <Box
            key={evt._id}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: idx === carouselIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: `url(${evt.photo || mockEvents[0].photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate(paths.tickets.event(evt._id))}
          >
            {/* Degradê escuro para dar contraste ao texto em qualquer foto */}
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: { 
                xs: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.95) 100%)', 
                md: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.95) 100%)' 
              } 
            }}>
              <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: { xs: 'flex-end', md: 'center' }, justifyContent: 'flex-end', pb: { xs: 6, md: 0 } }}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, color: '#111111', pl: { xs: 0, md: 4 } }}>
                  
                  {/* Chips */}
                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip size="small" label="Principal" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', backdropFilter: 'blur(4px)', fontWeight: 600, fontSize: '0.75rem' }} />
                    <Chip size="small" label="Premium" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', backdropFilter: 'blur(4px)', fontWeight: 600, fontSize: '0.75rem' }} />
                  </Stack>

                  <Typography variant="h1" sx={{ color: '#ffffff', mb: 1, fontWeight: 900, lineHeight: 1.1, fontSize: { xs: '2.2rem', md: '4rem' }, textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
                    {evt.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: { xs: 3, md: 4 }, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {evt.category || 'Categoria Internacional'}
                  </Typography>

                  <Stack spacing={1} mb={4}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      <Iconify icon="carbon:calendar" /> {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR') : 'Data a definir'} • 15:00
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 1, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      <Iconify icon="carbon:location" /> {evt.local?.split(',')[0] || 'Local'}
                    </Typography>
                  </Stack>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="contained" 
                      onClick={(e) => { e.stopPropagation(); navigate(paths.tickets.event(evt._id)); }} 
                      startIcon={<Iconify icon="carbon:ticket" />}
                      sx={{ 
                        bgcolor: '#8E33FF', 
                        color: '#ffffff',
                        px: { xs: 2.5, md: 5 }, 
                        py: { xs: 0.8, md: 1.5 }, 
                        fontSize: { xs: '0.85rem', md: '1.1rem' }, 
                        fontWeight: 600,
                        borderRadius: 2, 
                        boxShadow: '0 8px 24px rgba(142,51,255,0.3)',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#7a22e8' }
                      }}
                    >
                      Comprar
                    </Button>
                  </Box>
                </Box>
              </Container>
            </Box>
          </Box>
        ))}
        
        {/* Controles do Carrossel */}
        <IconButton 
          sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', top: '50%', left: 24, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: '#8E33FF' } }}
          onClick={(e) => { e.stopPropagation(); setCarouselIndex((prev) => (prev - 1 + Math.min(events.length, 5)) % Math.min(events.length, 5)); }}
        >
          <Iconify icon="carbon:chevron-left" />
        </IconButton>
        <IconButton 
          sx={{ display: { xs: 'none', md: 'flex' }, position: 'absolute', top: '50%', right: 24, transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: '#8E33FF' } }}
          onClick={(e) => { e.stopPropagation(); setCarouselIndex((prev) => (prev + 1) % Math.min(events.length, 5)); }}
        >
          <Iconify icon="carbon:chevron-right" />
        </IconButton>
        
        {/* Indicadores (Bolinhas) */}
        <Box sx={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1.5 }}>
          {events.slice(0, 5).map((_, idx) => (
            <Box 
              key={idx} 
              onClick={(e) => { e.stopPropagation(); setCarouselIndex(idx); }}
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === carouselIndex ? '#8E33FF' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s ease' }} 
            />
          ))}
        </Box>
      </Box>



      {/* 4. Agenda da Semana (Grid de Eventos) */}
      <Box sx={{ bgcolor: '#F4F6F8', pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 5 } }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="h3" sx={{ color: '#111111', fontSize: { xs: '1.5rem', md: '2.5rem' }, fontWeight: 800, m: 0 }}>
              {t('landing.agenda.title')}
            </Typography>
          </Box>
          <Button 
            sx={{ 
              color: '#8E33FF', 
              fontWeight: 600, 
              whiteSpace: 'nowrap', 
              fontSize: { xs: '0.85rem', md: '1rem' },
              flexShrink: 0 
            }} 
            endIcon={<Iconify icon="carbon:arrow-right" />}
          >
            {t('landing.agenda.seeAll')}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {events.slice(0, 4).map((evt) => (
            <Grid item xs={12} sm={6} md={3} key={evt._id}>
              <Card 
                onClick={() => navigate(paths.tickets.event(evt._id))}
                sx={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: 'none', 
                  border: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', height: { xs: 160, md: 200 } }}>
                  <CardMedia
                    component="img"
                    height="100%"
                    image={evt.photo || mockEvents[0].photo}
                    alt={evt.name}
                  />
                  <Chip 
                    label={evt.category || 'Música'} 
                    size="small" 
                    sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ffffff', color: '#8E33FF', fontWeight: 'bold' }} 
                  />
                  <IconButton 
                    onClick={(e) => { e.stopPropagation(); }}
                    sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                  >
                    <Iconify icon="carbon:favorite" width={18} />
                  </IconButton>
                </Box>
                
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#8E33FF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Iconify icon="carbon:calendar" /> {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Data a definir'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1, color: '#111111', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    {evt.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    <Iconify icon="carbon:location" /> {evt.local?.split(',')[0] || 'Local'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="outlined" color="primary" size="small" sx={{ borderRadius: 50, px: 3 }}>
                      Comprar
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      </Box>

      {/* 5. Categorias */}
      <Box sx={{ 
        backgroundImage: 'url(/images/templatetickets.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        py: 10 
      }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: '#8E33FF', fontWeight: 'bold', letterSpacing: 1.5 }}>EXPLORAR</Typography>
          <Typography variant="h3" sx={{ color: '#ffffff', mb: 5, fontSize: { xs: '1.8rem', md: '3rem' } }}>O que você quer ver?</Typography>
          
          <Grid container spacing={2}>
            {categoriesList.map((cat) => (
              <Grid item xs={6} sm={4} md={2} key={cat.slug}>
                <Box
                  onClick={() => handleCategoryClick(cat.slug)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, md: 4 },
                    borderRadius: '24px',
                    bgcolor: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid rgba(0,0,0,0.02)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 24px 48px rgba(142,51,255,0.25)',
                      borderColor: 'rgba(142,51,255,0.3)',
                      bgcolor: '#8E33FF',
                      '& .cat-icon-box': { bgcolor: '#ffffff', color: '#8E33FF', transform: 'scale(1.15)' },
                      '& .cat-title': { color: '#ffffff' },
                      '& .cat-subtitle': { color: 'rgba(255,255,255,0.8)' }
                    },
                  }}
                >
                  <Box className="cat-icon-box" sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(142,51,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5, color: '#8E33FF', transition: 'all 0.3s ease' }}>
                    <Iconify icon={cat.icon} width={28} />
                  </Box>
                  <Typography className="cat-title" variant="subtitle1" sx={{ fontWeight: 800, color: '#111111', transition: 'color 0.3s ease' }}>
                    {cat.name}
                  </Typography>
                  <Typography className="cat-subtitle" variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, transition: 'color 0.3s ease' }}>40 eventos</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 6. Banner de Vendas (Roxo e Verde) */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ 
          bgcolor: '#2C0D59', 
          borderRadius: '32px', 
          p: { xs: 3, md: 8 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Fundo de estrelas/pontos simples pra imitar a imagem */}
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <Box sx={{ maxWidth: 500, position: 'relative', zIndex: 2, mb: { xs: 4, md: 0 } }}>
            <Chip label={t('landing.producer.chip')} sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', mb: 3 }} icon={<Iconify icon="carbon:chart-line" />} />
            <Typography variant="h2" sx={{ color: '#ffffff', mb: 2, lineHeight: 1.1, fontSize: { xs: '2rem', md: '3.75rem' } }}>
              {t('landing.producer.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('landing.producer.subtitle')}
            </Typography>
          </Box>

          <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', p: 4, textAlign: 'center', minWidth: { xs: '100%', md: 350 }, position: 'relative', zIndex: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1 }}>{t('landing.producer.feeTitle')}</Typography>
            <Typography variant="h1" sx={{ color: '#9BEA00', fontSize: { xs: '3.5rem', md: '4rem' }, lineHeight: 1, mb: 1 }}>5%</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 4 }}>{t('landing.producer.feeSubtitle')}</Typography>
            
            <Button variant="contained" color="secondary" fullWidth size="large" startIcon={<Iconify icon="carbon:ticket" />} sx={{ py: 2, fontSize: 16 }}>
              {t('landing.producer.button')}
            </Button>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 2 }}>{t('landing.producer.info')}</Typography>
          </Card>
        </Box>
      </Container>

      {/* 7. Banner Cashless (Novo) */}
      <CashlessBanner />

      {/* 8. Carrossel de Clientes / Brands */}
      <Brands />
    </Box>
  );
}
