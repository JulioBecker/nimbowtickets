import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  TextField,
  MenuItem,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';

interface EventType {
  _id: string;
  name: string;
  photo?: string;
  date: string;
  local?: string;
  category?: string;
  description?: string;
  extraCost?: number;
}

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('q') || '';
  const initialCategory = queryParams.get('category') || '';
  const initialRegion = queryParams.get('region') || '';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [region, setRegion] = useState(initialRegion);
  const [priceType, setPriceType] = useState('all'); // 'all', 'free', 'paid'
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { label: 'Todas as Categorias', value: '' },
    { label: 'Shows', value: 'shows' },
    { label: 'Festas', value: 'festas' },
    { label: 'Feiras', value: 'feiras' },
    { label: 'Workshops', value: 'workshops' },
  ];

  const regions = [
    { label: 'Todas as Regiões', value: '' },
    { label: 'Sudeste', value: 'Sudeste' },
    { label: 'Sul', value: 'Sul' },
    { label: 'Nordeste', value: 'Nordeste' },
    { label: 'Centro-Oeste', value: 'Centro-Oeste' },
    { label: 'Norte', value: 'Norte' },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSearch(queryParams.get('q') || '');
    setCategory(queryParams.get('category') || '');
    setRegion(queryParams.get('region') || '');
  }, [location.search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const urlSearch = queryParams.get('q') || '';
      const urlCategory = queryParams.get('category') || '';
      const urlRegion = queryParams.get('region') || '';

      const params: any = {
        active: 'true',
        perPage: 30,
        search: urlSearch || undefined,
        category: urlCategory || undefined,
      };

      const { data } = await axiosInstance.get('/event', { params });
      let result = data?.data || [];

      if (urlRegion) {
        result = result.filter((evt: EventType) => {
          const loc = (evt.local || '').toLowerCase();
          const addr = (evt.description || '').toLowerCase();
          return loc.includes(urlRegion.toLowerCase()) || addr.includes(urlRegion.toLowerCase());
        });
      }

      if (priceType === 'free') {
        result = result.filter((evt: EventType) => (evt.extraCost || 0) === 0);
      } else if (priceType === 'paid') {
        result = result.filter((evt: EventType) => (evt.extraCost || 0) > 0);
      }

      setEvents(result);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, [location.search, priceType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const renderEventsContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress sx={{ color: '#8E33FF' }} />
        </Box>
      );
    }

    if (events.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Iconify icon="carbon:document-blank" width={64} height={64} sx={{ color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Nenhum evento encontrado</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tente ajustar ou limpar os filtros de busca.</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {events.map((evt) => (
          <Grid item xs={12} sm={6} key={evt._id}>
            <Card sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'none', border: '1px solid #f3f4f6', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative', height: 200 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={evt.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80'}
                  alt={evt.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(paths.tickets.event(evt._id))}
                />
                <Chip 
                  label={evt.category || 'Eventos'} 
                  size="small" 
                  sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#ffffff', color: '#8E33FF', fontWeight: 'bold' }} 
                />
                <IconButton sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.3)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}>
                  <Iconify icon="carbon:favorite" width={18} />
                </IconButton>
              </Box>
              
              <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ color: '#8E33FF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Iconify icon="carbon:calendar" /> {new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit', year: 'numeric' })}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 1, color: '#111111' }}>
                  {evt.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <Iconify icon="carbon:location" /> {evt.local?.split(',')[0] || 'Local'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>
                    {(evt.extraCost || 0) === 0 ? 'Gratuito' : `R$ ${evt.extraCost?.toFixed(2)}`}
                  </Typography>
                  <Button variant="outlined" color="primary" size="small" onClick={() => navigate(paths.tickets.event(evt._id))} sx={{ borderRadius: 50, px: 3 }}>
                    Comprar
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const handleApplyFilters = () => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.set('q', search);
    if (category) searchParams.set('category', category);
    if (region) searchParams.set('region', region);
    navigate(`${paths.tickets.search}?${searchParams.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setRegion('');
    setPriceType('all');
    navigate(paths.tickets.search);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#111111', textAlign: 'left' }}>
        Encontre seu Evento
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5, textAlign: 'left' }}>
        {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
      </Typography>

      <Grid container spacing={4}>
        
        {/* Left Side: Sidebar Filters */}
        <Grid item xs={12} md={3.5}>
          <Card sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left' }}>
              <Iconify icon="carbon:filter" sx={{ color: '#8E33FF' }} /> Filtros de Busca
            </Typography>

            <Stack spacing={3}>
              <TextField
                fullWidth
                size="small"
                label="Nome do evento"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              />

              <TextField
                fullWidth
                select
                size="small"
                label="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                size="small"
                label="Região"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              >
                {regions.map((reg) => (
                  <MenuItem key={reg.value} value={reg.value}>
                    {reg.label}
                  </MenuItem>
                ))}
              </TextField>

              <Divider />

              <FormControl component="fieldset" sx={{ textAlign: 'left' }}>
                <FormLabel component="legend" sx={{ fontWeight: 'bold', fontSize: 14, mb: 1 }}>Preço</FormLabel>
                <RadioGroup value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                  <FormControlLabel value="all" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />} label="Todos os eventos" />
                  <FormControlLabel value="free" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />} label="Gratuito" />
                  <FormControlLabel value="paid" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#8E33FF' } }} />} label="Pago" />
                </RadioGroup>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{ color: '#111111', borderColor: '#111111', fontWeight: 'bold' }}
                >
                  Limpar
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}
                >
                  Filtrar
                </Button>
              </Stack>

            </Stack>
          </Card>
        </Grid>

        {/* Right Side: Event Grid */}
        <Grid item xs={12} md={8.5}>
          {renderEventsContent()}
        </Grid>

      </Grid>
    </Container>
  );
}
