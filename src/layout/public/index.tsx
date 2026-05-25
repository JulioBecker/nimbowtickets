import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { useUserStore } from 'src/store/user';
import { useAuthStore } from 'src/store/auth';
import { paths } from 'src/routes/paths';
import CookieBanner from 'src/components/CookieBanner';

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const { user, logout: userLogout } = useUserStore();
  const { logout: authLogout } = useAuthStore();
  
  const logout = () => {
    authLogout();
    userLogout();
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('Todas as Regiões');
  const [anchorElRegion, setAnchorElRegion] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const regions = ['Todas as Regiões', 'Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`${paths.tickets.search}?q=${encodeURIComponent(searchQuery)}&region=${encodeURIComponent(region === 'Todas as Regiões' ? '' : region)}`);
  };

  const handleRegionSelect = (reg: string) => {
    setRegion(reg);
    setAnchorElRegion(null);
    const searchParams = new URLSearchParams(location.search);
    if (reg === 'Todas as Regiões') {
      searchParams.delete('region');
    } else {
      searchParams.set('region', reg);
    }
    navigate(`${paths.tickets.search}?${searchParams.toString()}`);
  };

  const handleUserMenuSelect = (path: string) => {
    setAnchorElUser(null);
    if (path === 'logout') {
      logout();
      navigate(paths.tickets.root);
    } else {
      navigate(path);
    }
  };

  const isMinimalHeader = location.pathname.includes('/event/') || location.pathname.includes('/checkout/');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F4F5F7' }}>
      
      {/* 1. Header Desktop & Mobile */}
      {!isMinimalHeader && (
        <AppBar position="sticky" sx={{ bgcolor: '#111111', borderBottom: '3px solid #9BEA00', py: 0.5 }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ gap: 2 }}>
              
              {/* Logo */}
              <Box onClick={() => navigate(paths.tickets.root)} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src="/images/NIMBOW TICKETS - FUNDO ESCURO.png"
                  alt="Nimbow Tickets"
                  sx={{ height: { xs: 15, md: 18 }, objectFit: 'contain' }}
                />
              </Box>

              {!isMobile && (
                <>
                  {/* Search Bar */}
                  <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, maxWidth: 450, ml: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar eventos, shows, teatros..."
                      sx={{
                        bgcolor: '#222222',
                        borderRadius: 1,
                        input: { color: '#ffffff' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: '1px solid #8E33FF' },
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="carbon:search" sx={{ color: 'rgba(255,255,255,0.5)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Region Selector */}
                  <Box>
                    <Button
                      onClick={(e) => setAnchorElRegion(e.currentTarget)}
                      startIcon={<Iconify icon="carbon:map" sx={{ color: '#8E33FF' }} />}
                      endIcon={<Iconify icon="carbon:chevron-down" />}
                      sx={{ color: '#ffffff', fontWeight: 600, textTransform: 'none' }}
                    >
                      {region === 'Todas as Regiões' ? 'Todas as Regiões' : region}
                    </Button>
                    <Menu
                      anchorEl={anchorElRegion}
                      open={Boolean(anchorElRegion)}
                      onClose={() => setAnchorElRegion(null)}
                      PaperProps={{ sx: { bgcolor: '#222222', color: '#ffffff', mt: 1 } }}
                    >
                      {regions.map((reg) => (
                        <MenuItem key={reg} onClick={() => handleRegionSelect(reg)} sx={{ '&:hover': { bgcolor: '#8E33FF', color: '#111111' } }}>
                          {reg}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                </>
              )}

              {/* User Navigation Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                {!isMobile ? (
                  <>
                    <Button
                      onClick={() => navigate(paths.dashboard.root)}
                      startIcon={<Iconify icon="carbon:ticket" sx={{ color: '#8E33FF' }} />}
                      sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
                    >
                      Meus Ingressos
                    </Button>

                    {user ? (
                      <>
                        <Button
                          onClick={(e) => setAnchorElUser(e.currentTarget)}
                          startIcon={<Iconify icon="carbon:user" sx={{ color: '#8E33FF' }} />}
                          sx={{ color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
                        >
                          Olá, {user.name.split(' ')[0]}
                        </Button>
                        <Menu
                          anchorEl={anchorElUser}
                          open={Boolean(anchorElUser)}
                          onClose={() => setAnchorElUser(null)}
                          PaperProps={{ sx: { bgcolor: '#222222', color: '#ffffff', mt: 1, minWidth: 180 } }}
                        >
                          <MenuItem onClick={() => handleUserMenuSelect(paths.dashboard.root)} sx={{ '&:hover': { bgcolor: '#333333' } }}>
                            <Iconify icon="carbon:user" sx={{ mr: 1, color: '#8E33FF' }} /> Painel do Cliente
                          </MenuItem>
                          {user?.role === 'admin' && (
                            <MenuItem onClick={() => handleUserMenuSelect(paths.dashboard.producer)} sx={{ '&:hover': { bgcolor: '#333333' } }}>
                              <Iconify icon="carbon:event" sx={{ mr: 1, color: '#8E33FF' }} /> Área do Produtor
                            </MenuItem>
                          )}
                          <MenuItem onClick={() => handleUserMenuSelect('logout')} sx={{ color: '#ff5630', '&:hover': { bgcolor: '#333333' } }}>
                            <Iconify icon="carbon:logout" sx={{ mr: 1 }} /> Sair
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => navigate(paths.auth.login)}
                        sx={{
                          bgcolor: '#9BEA00',
                          color: '#111111',
                          fontWeight: 'bold',
                          '&:hover': { bgcolor: '#8ade00' },
                        }}
                      >
                        Entrar
                      </Button>
                    )}
                  </>
                ) : (
                  /* Mobile Menu Trigger */
                  <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#ffffff' }}>
                    <Iconify icon="carbon:menu" />
                  </IconButton>
                )}
              </Box>

            </Toolbar>
          </Container>
        </AppBar>
      )}

      {/* Drawer Responsivo Mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: '#ffffff', color: '#111111', p: 2, boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8E33FF' }}>Menu</Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#111111' }}>
            <Iconify icon="carbon:close" />
          </IconButton>
        </Box>

        {/* Mobile Search input */}
        <Box component="form" onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }} sx={{ mb: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar eventos..."
            sx={{
              bgcolor: '#F4F5F7',
              borderRadius: 1,
              input: { color: '#111111' },
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: '1px solid #8E33FF' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="carbon:search" sx={{ color: '#8E33FF' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ pt: 0, mt: 0 }}>
          {/* Main Items - depends on user state */}
          {(!user ? [
            { label: 'Início', path: paths.tickets.root },
            { label: 'Eventos', path: paths.tickets.search },
          ] : [
            { label: 'Início', path: paths.tickets.root },
            { label: 'Meus Dados', path: `${paths.dashboard.root}?tab=0`, icon: 'carbon:user' },
            { label: 'Meus Ingressos', path: `${paths.dashboard.root}?tab=1`, icon: 'carbon:ticket' },
            { label: 'Favoritos', path: `${paths.dashboard.root}?tab=2`, icon: 'carbon:favorite' },
            { label: 'Meu Cash', path: `${paths.dashboard.root}?tab=3`, icon: 'carbon:wallet' },
            { label: 'Central de Ajuda', path: `${paths.dashboard.root}?tab=4`, icon: 'carbon:help' },
            ...(user.role === 'admin' ? [
              { label: 'Aprovação de Eventos', path: `${paths.dashboard.root}?tab=5`, icon: 'carbon:checkmark-outline' },
              { label: 'Área do Produtor', path: paths.dashboard.producer, icon: 'carbon:event' }
            ] : []),
          ]).map((item) => (
            <ListItem
              button
              key={item.label}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ 
                borderBottom: '1px solid rgba(0,0,0,0.06)', 
                py: 1.5,
                color: '#111111',
                '&:hover': { bgcolor: 'rgba(142,51,255,0.04)' }
              }}
            >
              {'icon' in item && <Iconify icon={item.icon as string} sx={{ mr: 2, color: '#8E33FF' }} />}
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 15, fontWeight: 500, color: '#111111' }} />
            </ListItem>
          ))}
          
          {user ? (
            <ListItem
              button
              onClick={() => { userLogout(); authLogout(); setMobileOpen(false); }}
              sx={{ 
                color: '#ff5630', 
                py: 1.5, 
                mt: 1,
                '&:hover': { bgcolor: 'rgba(255, 86, 48, 0.04)' }
              }}
            >
              <Iconify icon="carbon:logout" sx={{ mr: 2 }} />
              <ListItemText primary="Sair" primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItem>
          ) : (
            <ListItem
              button
              onClick={() => { navigate(paths.auth.login); setMobileOpen(false); }}
              sx={{ bgcolor: '#9BEA00', color: '#111111', mt: 3, borderRadius: 1, py: 1.5, '&:hover': { bgcolor: '#8ade00' } }}
            >
              <ListItemText primary="Entrar / Cadastrar" sx={{ textAlign: 'center' }} primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* 2. Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        {children || <Outlet />}
      </Box>

      {/* 3. Footer (Institutional Links & Socials) */}
      <Box sx={{ bgcolor: '#1A1A1A', color: '#ffffff', py: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
              gap: 4,
              mb: 6,
            }}
          >
            {/* Column 1: About & Info */}
            <Box>
              <Box
                component="img"
                src="/images/NIMBOW TICKETS - FUNDO ESCURO.png"
                alt="Nimbow Tickets"
                sx={{ height: 35, mb: 2, objectFit: 'contain' }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, pr: 4 }}>
                A Nimbow Tickets é a solução inteligente e integrada para venda de ingressos, controle de acessos em tempo real e pagamentos sem dinheiro (cashless) para festivais, shows e feiras.
              </Typography>
            </Box>

            {/* Column 2: Consumers */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#8E33FF' }}>Para Consumidores</Typography>
              <List sx={{ p: 0 }}>
                <ListItem onClick={() => navigate(paths.dashboard.root)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Meus Ingressos</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.privacyPolicy)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Política de Privacidade</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.termsOfUse)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Termos de Uso</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.halfPriceRules)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Meia Entrada & Regras</ListItem>
              </List>
            </Box>

            {/* Column 3: Producers */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#8E33FF' }}>Para Produtores</Typography>
              <List sx={{ p: 0 }}>
                {user?.role === 'admin' && (
                  <ListItem onClick={() => navigate(paths.dashboard.producer)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Criar Evento</ListItem>
                )}
                <ListItem onClick={() => navigate(paths.tickets.serviceFees)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Taxas de Serviço</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.managementAB)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Nimbow Gestão A&B</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.cashlessNfc)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Operação Cashless NFC</ListItem>
              </List>
            </Box>

            {/* Column 4: Help Desk */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#8E33FF' }}>Atendimento</Typography>
              <List sx={{ p: 0 }}>
                <ListItem onClick={() => navigate(paths.tickets.helpCenter)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Central de Ajuda</ListItem>
                <ListItem onClick={() => navigate(paths.tickets.contactUs)} sx={{ p: 0, mb: 1, cursor: 'pointer', '&:hover': { color: '#8E33FF' } }}>Fale Conosco</ListItem>
                <ListItem
                  component="a"
                  href="https://wa.me/5541988917885"
                  target="_blank"
                  rel="noreferrer"
                  sx={{ p: 0, mb: 1, cursor: 'pointer', color: '#8E33FF', '&:hover': { textDecoration: 'underline' } }}
                >
                  WhatsApp Suporte
                </ListItem>
              </List>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* Left: Copyright */}
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, mb: 1.5 }}>
                © {new Date().getFullYear()} Nimbow Tickets. Todos os direitos reservados.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', opacity: 0.7 }}>
                <Iconify icon="logos:visa" width={28} />
                <Iconify icon="logos:mastercard" width={28} />
                <Iconify icon="logos:elo" width={28} />
                <Iconify icon="logos:pix" width={28} />
              </Box>
            </Box>

            {/* Middle: Social links */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton
                component="a"
                href="https://www.instagram.com/nimbowoficial/"
                target="_blank"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#8E33FF' }, p: 0.5 }}
              >
                <Iconify icon="mdi:instagram" width={22} />
              </IconButton>
              <IconButton
                component="a"
                href="mailto:contato@nimbow.com.br"
                sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#8E33FF' }, p: 0.5 }}
              >
                <Iconify icon="carbon:email" width={22} />
              </IconButton>
            </Box>

            {/* Right: Small logo */}
            <Box
              component="img"
              src="/images/NIMBOW TICKETS - FUNDO ESCURO.png"
              alt="Nimbow"
              sx={{ height: 25, objectFit: 'contain', opacity: 0.5 }}
            />
          </Box>
        </Container>
      </Box>

      {/* Floating WhatsApp Button */}
      <Box
        component="a"
        href="https://wa.me/5541988917885?text=Olá! Preciso de ajuda com os ingressos Nimbow."
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 9999,
          bgcolor: '#25D366',
          color: '#ffffff',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          },
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.5)' },
            '70%': { boxShadow: '0 0 0 15px rgba(37, 211, 102, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
          }
        }}
      >
        <Iconify icon="mdi:whatsapp" width={32} height={32} />
      </Box>

      {/* Cookie Banner */}
      <CookieBanner />
    </Box>
  );
}
