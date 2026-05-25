import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Avatar,
  CardActionArea,
  Divider,
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
  extraCost?: number;
}

interface ProducerType {
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  slug: string;
}

export default function ProducerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [producer, setProducer] = useState<ProducerType | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducerData() {
      setLoading(true);
      try {
        const { data: usersData } = await axiosInstance.get('/user', {
          params: { search: slug, perPage: 1 }
        });

        const prodUser = (usersData?.data || []).find((u: any) => u.producerSlug === slug || u.name.toLowerCase().replace(/\s+/g, '-') === slug);

        if (prodUser) {
          setProducer({
            name: prodUser.producerName || prodUser.name,
            logo: prodUser.producerLogo || prodUser.photo,
            banner: prodUser.producerBanner || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
            description: prodUser.producerDescription || 'Produtor verificado da plataforma Nimbow Tickets.',
            slug: slug || '',
          });

          const { data: eventsData } = await axiosInstance.get('/event', {
            params: { active: 'true', perPage: 20 }
          });

          const filteredEvents = (eventsData?.data || []).filter((evt: any) =>
            evt.producerSlug === slug || (evt.managers && evt.managers.some((m: any) => String(m._id) === String(prodUser._id)))
          );

          setEvents(filteredEvents);
        } else {
          setProducer({
            name: slug?.replace(/-/g, ' ').toUpperCase() || 'Produtor Nimbow',
            logo: '',
            banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
            description: 'Produtor parceiro de eventos e festivais da Nimbow Tickets.',
            slug: slug || '',
          });

          const { data: eventsData } = await axiosInstance.get('/event', {
            params: { active: 'true', perPage: 6 }
          });
          setEvents(eventsData?.data || []);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do produtor:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducerData();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#8E33FF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8, textAlign: 'left' }}>
      
      <Box
        sx={{
          height: 320,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url(${producer?.banner || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          mb: 8,
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: 20,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
            }}
          >
            <Avatar
              src={producer?.logo}
              alt={producer?.name}
              sx={{
                width: 110,
                height: 110,
                border: '4px solid #F4F5F7',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                bgcolor: '#ffffff',
              }}
            />
            <Box sx={{ pb: 1, color: '#ffffff' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                {producer?.name}
              </Typography>
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textShadow: '1px 1px 2px rgba(0,0,0,0.8)', color: '#8E33FF', fontWeight: 'bold' }}>
                <Iconify icon="carbon:checkmark-filled" width={14} /> Produtor Verificado
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Sobre o Produtor</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
                {producer?.description}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Typography variant="caption" sx={{ color: 'text.light' }}>
                Eventos listados: {events.length}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Eventos Deste Produtor</Typography>
            
            {events.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#ffffff', borderRadius: 2 }}>
                <Iconify icon="carbon:calendar" width={48} sx={{ color: 'text.secondary', mb: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Nenhum evento ativo</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Fique atento para as próximas novidades deste produtor.</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {events.map((evt) => (
                  <Grid item xs={12} sm={6} key={evt._id}>
                    <Card sx={{ borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                      <CardActionArea onClick={() => navigate(paths.tickets.event(evt._id))}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={evt.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80'}
                          alt={evt.name}
                        />
                        <CardContent>
                          <Typography variant="caption" sx={{ color: '#7A19E6', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                            {evt.category || 'Shows'}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#111111', lineHeight: 1.2 }}>
                            {evt.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            {new Date(evt.date).toLocaleDateString('pt-BR')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {evt.local?.split(',')[0]}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

        </Grid>
      </Container>

    </Box>
  );
}
