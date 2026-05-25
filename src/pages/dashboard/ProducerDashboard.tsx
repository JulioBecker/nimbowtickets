import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Stack,
  CircularProgress,
  TextField,
  Avatar,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormLabel,
  Tabs,
  Tab,
  useMediaQuery,
  Select,
  FormControl,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useUserStore } from 'src/store/user';
import { useAuthStore } from 'src/store/auth';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import Notiflix from 'notiflix';
import SeatMapBuilder, { MapConfig, DEFAULT_MAP_CONFIG } from 'src/components/SeatMapBuilder';

// High-contrast colors readable on light backgrounds
const EVENT_STATUS_COLORS: Record<string, string> = {
  pending: '#d97706', // Amber-600
  approved: '#16a34a', // Green-600
  rejected: '#dc2626', // Red-600
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const EVENT_CATEGORIES = [
  'Shows & Música',
  'Festas & Baladas',
  'Feiras & Exposições',
  'Workshops & Cursos',
  'Esportes & Fitness',
  'Teatro & Arte',
  'Gastronomia',
  'Infantil & Família',
  'Congresso & Palestra',
  'Outro',
];

const EVENT_SUBJECTS = [
  'Show / Concerto',
  'Festa / Balada',
  'Festival',
  'Peça de Teatro',
  'Stand Up Comedy',
  'Palestra / Painel',
  'Curso / Workshop',
  'Feira / Networking',
  'Campeonato / Treino',
  'Jantar / Degustação',
  'Outro',
];

const NOMENCLATURES = [
  { value: 'ingresso', label: 'Ingresso' },
  { value: 'inscricao', label: 'Inscrição' },
  { value: 'passaporte', label: 'Passaporte' },
  { value: 'ticket', label: 'Ticket' },
];

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, setUser, logout: logoutUser } = useUserStore();
  const { logout: logoutAuth } = useAuthStore();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);

  // Navigation
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const tabFromUrl = parseInt(searchParams.get('tab') || '0', 10);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // Core Data
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [extraData, setExtraData] = useState<any>(null);

  // Tab 2: Sua Página (Producer Profile)
  const [producerName, setProducerName] = useState(user?.producerName || user?.name || '');
  const [producerSlug, setProducerSlug] = useState(user?.producerSlug || '');
  const [producerLogo, setProducerLogo] = useState(user?.producerLogo || '');
  const [producerBanner, setProducerBanner] = useState(user?.producerBanner || '');
  const [producerDescription, setProducerDescription] = useState(user?.producerDescription || '');
  const [showPastEvents, setShowPastEvents] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Gestão Financeira Search & Filter
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeStatus, setFinanceStatus] = useState('all');

  // Event Creation Flow State
  const [createStep, setCreateStep] = useState(0);
  // Step 1: Informações Básicas
  const [evName, setEvName] = useState('');
  const [evPhoto, setEvPhoto] = useState('');
  const [evCategory, setEvCategory] = useState('');
  const [evSubject, setEvSubject] = useState('');
  const eventPhotoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Data e Horário
  const [evStartDate, setEvStartDate] = useState('');
  const [evStartTime, setEvStartTime] = useState('20:00');
  const [evEndDate, setEvEndDate] = useState('');
  const [evEndTime, setEvEndTime] = useState('23:30');
  const [evAdditionalDates, setEvAdditionalDates] = useState<string[]>([]);

  // Step 3: Descrição
  const [evDescription, setEvDescription] = useState('');

  // Step 4: Localização
  const [evLocalType, setEvLocalType] = useState<'presencial' | 'online'>('presencial');
  const [evLocalName, setEvLocalName] = useState('');
  const [evCEP, setEvCEP] = useState('');
  const [evStreet, setEvStreet] = useState('');
  const [evNumber, setEvNumber] = useState('');
  const [evComplement, setEvComplement] = useState('');
  const [evNeighborhood, setEvNeighborhood] = useState('');
  const [evCity, setEvCity] = useState('');
  const [evState, setEvState] = useState('');

  // Step 5: Ingressos
  const [evTickets, setEvTickets] = useState<any[]>([]);
  const [evAbsorbFee, setEvAbsorbFee] = useState(false);
  const [evTicketNomenclature, setEvTicketNomenclature] = useState('ingresso');
  const [evSellProducts, setEvSellProducts] = useState(false);
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);

  // Drag and drop for tickets sorting
  const [draggedTicketIndex, setDraggedTicketIndex] = useState<number | null>(null);

  const handleTicketDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTicketIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTicketDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTicketIndex === null || draggedTicketIndex === index) return;

    const updatedTickets = [...evTickets];
    const draggedItem = updatedTickets[draggedTicketIndex];
    
    updatedTickets.splice(draggedTicketIndex, 1);
    updatedTickets.splice(index, 0, draggedItem);
    
    setDraggedTicketIndex(index);
    setEvTickets(updatedTickets);
  };

  const handleTicketDragEnd = () => {
    setDraggedTicketIndex(null);
  };

  // Delete event state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Edit event state
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [initialTicketIds, setInitialTicketIds] = useState<string[]>([]);

  // Draft confirm dialog state
  const [draftConfirmOpen, setDraftConfirmOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  // Ticket Modal Form
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketModalType, setTicketModalType] = useState<'free' | 'paid'>('free');
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
  const [newTicketName, setNewTicketName] = useState('');
  const [newTicketQty, setNewTicketQty] = useState('');
  const [newTicketPrice, setNewTicketPrice] = useState('');
  const [newTicketStartDate, setNewTicketStartDate] = useState('');
  const [newTicketStartTime, setNewTicketStartTime] = useState('12:00');
  const [newTicketEndDate, setNewTicketEndDate] = useState('');
  const [newTicketEndTime, setNewTicketEndTime] = useState('22:00');
  const [newTicketWhoCanBuy, setNewTicketWhoCanBuy] = useState('public');
  const [newTicketMinQty, setNewTicketMinQty] = useState('1');
  const [newTicketMaxQty, setNewTicketMaxQty] = useState('5');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketVisibility, setNewTicketVisibility] = useState(true);
  const [newTicketMeiaEntrada, setNewTicketMeiaEntrada] = useState(false);

  // Step 6: Sobre o Produtor
  const [evProducerName, setEvProducerName] = useState(user?.producerName || user?.name || '');
  const [evProducerDescription, setEvProducerDescription] = useState(user?.producerDescription || '');

  // Step 7: Responsabilidades & Publicação
  const [evTermsAccepted, setEvTermsAccepted] = useState(false);
  const [evVisibility, setEvVisibility] = useState<'public' | 'private'>('public');

  const [submittingEvent, setSubmittingEvent] = useState(false);

  useEffect(() => {
    loadMyEvents();
    loadOrders();
  }, []);

  // Item 2: CEP Automático
  useEffect(() => {
    const cleanCEP = evCEP.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      const fetchAddress = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
          if (res.ok) {
            const data = await res.json();
            if (data && !data.erro) {
              setEvStreet(data.logradouro || '');
              setEvNeighborhood(data.bairro || '');
              setEvCity(data.localidade || '');
              setEvState(data.uf || '');
              return;
            }
          }
          await tryFallbackCEP(cleanCEP);
        } catch (err) {
          console.warn('ViaCEP falhou, tentando fallback...', err);
          await tryFallbackCEP(cleanCEP);
        }
      };

      const tryFallbackCEP = async (cep: string) => {
        try {
          // Try BrasilAPI
          const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
          if (res.ok) {
            const data = await res.json();
            if (data && !data.errors) {
              setEvStreet(data.street || '');
              setEvNeighborhood(data.neighborhood || '');
              setEvCity(data.city || '');
              setEvState(data.state || '');
              return;
            }
          }
        } catch (err) {
          console.warn('BrasilAPI falhou, tentando AwesomeAPI...', err);
        }

        try {
          // Try AwesomeAPI
          const res = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              setEvStreet(data.address || '');
              setEvNeighborhood(data.district || '');
              setEvCity(data.city || '');
              setEvState(data.state || '');
              return;
            }
          }
        } catch (err) {
          console.error('Erro no fallback do CEP:', err);
        }
      };

      fetchAddress();
    }
  }, [evCEP]);

  // Item 6: Rascunho de Evento (Salvamento automático)
  useEffect(() => {
    if (isCreatingEvent && !isEditingEvent) {
      const draft = {
        evName, evCategory, evSubject,
        evStartDate, evStartTime, evEndDate, evEndTime, evAdditionalDates,
        evDescription,
        evLocalType, evLocalName, evCEP, evStreet, evNumber, evComplement, evNeighborhood, evCity, evState,
        evTickets, evAbsorbFee, evTicketNomenclature, evSellProducts, mapConfig,
        evProducerName, evProducerDescription, evVisibility, createStep
      };
      localStorage.setItem('nimbow_event_draft', JSON.stringify(draft));
    }
  }, [
    isCreatingEvent, isEditingEvent,
    evName, evCategory, evSubject,
    evStartDate, evStartTime, evEndDate, evEndTime, evAdditionalDates,
    evDescription,
    evLocalType, evLocalName, evCEP, evStreet, evNumber, evComplement, evNeighborhood, evCity, evState,
    evTickets, evAbsorbFee, evTicketNomenclature, evSellProducts, mapConfig,
    evProducerName, evProducerDescription, evVisibility, createStep
  ]);

  const loadMyEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data } = await axiosInstance.get('/event/me');
      setMyEvents(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await axiosInstance.get('/order?perPage=1000');
      setOrders(data?.docs || []);
      setExtraData(data?.extraData || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    logoutAuth();
    logoutUser();
    navigate(paths.tickets.root);
  };

  const handleSaveProducerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!producerName) {
      Notiflix.Notify.warning('O nome do produtor é obrigatório.');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await axiosInstance.put('/user/me', {
        producerName,
        producerSlug: producerSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        producerLogo,
        producerBanner,
        producerDescription,
      });
      setUser(data);
      Notiflix.Notify.success('Perfil de produtor atualizado com sucesso!');
    } catch (err) {
      Notiflix.Notify.failure('Erro ao salvar perfil do produtor.');
    } finally {
      setSavingProfile(false);
    }
  };

  const parseAddress = (addressStr: string) => {
    let street = '';
    let number = '';
    let complement = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let cep = '';

    if (!addressStr) return { street, number, complement, neighborhood, city, state, cep };

    let cleanAddress = addressStr;
    const cepMatch = cleanAddress.match(/\(CEP:\s*([^)]+)\)/);
    if (cepMatch) {
      cep = cepMatch[1].trim();
      cleanAddress = cleanAddress.replace(/\(CEP:[^)]+\)/, '').trim();
    }

    const parts = cleanAddress.split(' - ');
    if (parts.length >= 3) {
      const mainStreetPart = parts[0];
      
      if (parts.length === 3) {
        state = parts[2].trim();
        const neighCity = parts[1].split(', ');
        if (neighCity.length >= 2) {
          neighborhood = neighCity[0].trim();
          city = neighCity[1].trim();
        } else {
          neighborhood = parts[1].trim();
        }
      } else if (parts.length >= 4) {
        state = parts[parts.length - 1].trim();
        city = parts[parts.length - 2].trim();
        neighborhood = parts[parts.length - 3].trim();
      }

      const commaIndex = mainStreetPart.indexOf(',');
      if (commaIndex !== -1) {
        street = mainStreetPart.substring(0, commaIndex).trim();
        const rest = mainStreetPart.substring(commaIndex + 1).trim();
        
        const compMatch = rest.match(/([^(]+)(?:\(([^)]+)\))?/);
        if (compMatch) {
          number = compMatch[1].trim();
          complement = compMatch[2] ? compMatch[2].trim() : '';
        } else {
          number = rest;
        }
      } else {
        street = mainStreetPart.trim();
      }
    } else {
      street = cleanAddress;
    }

    return { street, number, complement, neighborhood, city, state, cep };
  };

  const clearForm = () => {
    setEvName('');
    setEvPhoto('');
    setEvCategory('');
    setEvSubject('');
    setEvStartDate('');
    setEvStartTime('20:00');
    setEvEndDate('');
    setEvEndTime('23:30');
    setEvAdditionalDates([]);
    setEvDescription('');
    setEvLocalName('');
    setEvCEP('');
    setEvStreet('');
    setEvNumber('');
    setEvComplement('');
    setEvNeighborhood('');
    setEvCity('');
    setEvState('');
    setEvTickets([]);
    setEvAbsorbFee(false);
    setEvTicketNomenclature('ingresso');
    setEvSellProducts(false);
    setMapConfig(DEFAULT_MAP_CONFIG);
    // Item 4: Pull producer data from account profile
    setEvProducerName(user?.producerName || user?.name || '');
    setEvProducerDescription(user?.producerDescription || '');
    setEvVisibility('public');
    setCreateStep(0);
    setIsEditingEvent(false);
    setEditingEventId(null);
  };

  const restoreDraft = (draft: any) => {
    if (!draft) return;
    setEvName(draft.evName || '');
    setEvCategory(draft.evCategory || '');
    setEvSubject(draft.evSubject || '');
    setEvStartDate(draft.evStartDate || '');
    setEvStartTime(draft.evStartTime || '20:00');
    setEvEndDate(draft.evEndDate || '');
    setEvEndTime(draft.evEndTime || '23:30');
    setEvAdditionalDates(draft.evAdditionalDates || []);
    setEvDescription(draft.evDescription || '');
    setEvLocalType(draft.evLocalType || 'presencial');
    setEvLocalName(draft.evLocalName || '');
    setEvCEP(draft.evCEP || '');
    setEvStreet(draft.evStreet || '');
    setEvNumber(draft.evNumber || '');
    setEvComplement(draft.evComplement || '');
    setEvNeighborhood(draft.evNeighborhood || '');
    setEvCity(draft.evCity || '');
    setEvState(draft.evState || '');
    setEvTickets(draft.evTickets || []);
    setEvAbsorbFee(draft.evAbsorbFee || false);
    setEvTicketNomenclature(draft.evTicketNomenclature || 'ingresso');
    setEvSellProducts(draft.evSellProducts || false);
    setMapConfig(draft.mapConfig || DEFAULT_MAP_CONFIG);
    setEvProducerName(draft.evProducerName || user?.producerName || user?.name || '');
    setEvProducerDescription(draft.evProducerDescription || user?.producerDescription || '');
    setEvVisibility(draft.evVisibility || 'public');
    setCreateStep(draft.createStep || 0);
  };

  const handleStartCreateEvent = () => {
    const draftStr = localStorage.getItem('nimbow_event_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setPendingDraft(draft);
        setDraftConfirmOpen(true);
      } catch (err) {
        localStorage.removeItem('nimbow_event_draft');
        clearForm();
        setIsEditingEvent(false);
        setEditingEventId(null);
        setIsCreatingEvent(true);
      }
    } else {
      clearForm();
      setIsEditingEvent(false);
      setEditingEventId(null);
      setIsCreatingEvent(true);
    }
  };

  const handleStartEditEvent = async (evt: any) => {
    setLoadingEvents(true);
    try {
      const { data: eventData } = await axiosInstance.get(`/event/${evt._id}`);
      const fullEvent = eventData?.event || eventData;

      const { data: productsData } = await axiosInstance.get(`/product`, {
        params: { event: evt._id, perPage: 100 },
      });
      const products = productsData?.data || productsData?.products || productsData || [];
      const ticketsArray = Array.isArray(products) ? products : [];

      setIsEditingEvent(true);
      setEditingEventId(evt._id);
      setCreateStep(0);

      setEvName(fullEvent.name || '');
      setEvPhoto(fullEvent.photo || '');
      setEvCategory(fullEvent.category || '');
      setEvSubject(fullEvent.subject || '');
      
      if (fullEvent.date) {
        const evtDate = new Date(fullEvent.date);
        setEvStartDate(evtDate.toISOString().split('T')[0]);
        setEvStartTime(evtDate.toTimeString().split(' ')[0].substring(0, 5));
      }

      if (fullEvent.endDate) {
        const evtEndDate = new Date(fullEvent.endDate);
        setEvEndDate(evtEndDate.toISOString().split('T')[0]);
        setEvEndTime(evtEndDate.toTimeString().split(' ')[0].substring(0, 5));
      } else {
        setEvEndDate('');
        setEvEndTime('23:30');
      }
      
      if (fullEvent.additionalDates && fullEvent.additionalDates.length > 0) {
        setEvAdditionalDates(fullEvent.additionalDates.map((d: string) => d.split('T')[0]));
      } else {
        setEvAdditionalDates([]);
      }

      setEvDescription(fullEvent.description || '');
      
      const parsedAddress = parseAddress(fullEvent.address || '');
      setEvCEP(parsedAddress.cep);
      setEvStreet(parsedAddress.street);
      setEvNumber(parsedAddress.number);
      setEvComplement(parsedAddress.complement);
      setEvNeighborhood(parsedAddress.neighborhood);
      setEvCity(parsedAddress.city);
      setEvState(parsedAddress.state);
      
      setEvLocalType(fullEvent.local === 'Online' ? 'online' : 'presencial');
      setEvLocalName(fullEvent.local && fullEvent.local !== 'Online' ? fullEvent.local : '');

      const mappedTickets = ticketsArray.map((prod: any) => {
        let ticketStartDate = '';
        let ticketStartTime = '12:00';
        let ticketEndDate = '';
        let ticketEndTime = '22:00';

        if (prod.startDate) {
          const sd = new Date(prod.startDate);
          ticketStartDate = sd.toISOString().split('T')[0];
          ticketStartTime = sd.toTimeString().split(' ')[0].substring(0, 5);
        }
        if (prod.endDate) {
          const ed = new Date(prod.endDate);
          ticketEndDate = ed.toISOString().split('T')[0];
          ticketEndTime = ed.toTimeString().split(' ')[0].substring(0, 5);
        }

        return {
          _id: prod._id,
          name: prod.name,
          price: prod.price,
          quantity: prod.stock || 0,
          description: prod.description || '',
          startDate: ticketStartDate || (fullEvent.date ? fullEvent.date.split('T')[0] : ''),
          startTime: ticketStartTime,
          endDate: ticketEndDate || '',
          endTime: ticketEndTime,
          visible: prod.active ?? true,
          whoCanBuy: 'public',
          minQty: 1,
          maxQty: 5
        };
      });

      setEvTickets(mappedTickets);
      setInitialTicketIds(ticketsArray.map((t: any) => t._id));

      setEvProducerName(fullEvent.producerName || '');
      setEvProducerDescription(fullEvent.producerDescription || '');
      setEvVisibility(fullEvent.active ? 'public' : 'private');

      if (fullEvent.mapConfig) {
        setMapConfig(fullEvent.mapConfig);
      } else {
        setMapConfig(DEFAULT_MAP_CONFIG);
      }

      setIsCreatingEvent(true);
    } catch (err: any) {
      console.error(err);
      Notiflix.Notify.failure('Erro ao carregar dados do evento para edição.');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Image upload helpers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProducerLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProducerBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEventPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEvPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddTicket = (type: 'free' | 'paid') => {
    setTicketModalType(type);
    setEditingTicketIndex(null);
    setNewTicketName(type === 'free' ? 'Ingresso Gratuito' : 'Ingresso Lote 1');
    setNewTicketPrice(type === 'free' ? '0' : '50');
    setNewTicketQty('100');
    setNewTicketStartDate(evStartDate || new Date().toISOString().split('T')[0]);
    setNewTicketEndDate(evEndDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setNewTicketDesc('');
    setNewTicketMinQty('1');
    setNewTicketMaxQty('5');
    setNewTicketWhoCanBuy('public');
    setNewTicketVisibility(true);
    setNewTicketMeiaEntrada(false);
    setTicketModalOpen(true);
  };

  const handleOpenEditTicket = (index: number) => {
    const ticket = evTickets[index];
    setTicketModalType(ticket.price === 0 ? 'free' : 'paid');
    setEditingTicketIndex(index);
    setNewTicketName(ticket.name);
    setNewTicketPrice(ticket.price.toString());
    setNewTicketQty(ticket.quantity.toString());
    setNewTicketStartDate(ticket.startDate);
    setNewTicketStartTime(ticket.startTime);
    setNewTicketEndDate(ticket.endDate);
    setNewTicketEndTime(ticket.endTime);
    setNewTicketDesc(ticket.description || '');
    setNewTicketMinQty(ticket.minQty.toString());
    setNewTicketMaxQty(ticket.maxQty.toString());
    setNewTicketWhoCanBuy(ticket.whoCanBuy);
    setNewTicketVisibility(ticket.visible);
    setNewTicketMeiaEntrada(false); // Meia-entrada toggle is for creation only for simplicity
    setTicketModalOpen(true);
  };

  const handleAddTicket = () => {
    if (!newTicketName || !newTicketQty) {
      Notiflix.Notify.warning('Por favor, preencha o nome e a quantidade do ingresso.');
      return;
    }
    const qty = parseInt(newTicketQty);
    const price = ticketModalType === 'free' ? 0 : parseFloat(newTicketPrice || '0');

    if (isNaN(qty) || qty <= 0) {
      Notiflix.Notify.warning('A quantidade deve ser um número válido maior que zero.');
      return;
    }
    if (ticketModalType === 'paid' && (isNaN(price) || price < 0)) {
      Notiflix.Notify.warning('O preço deve ser um valor positivo.');
      return;
    }

    const ticketObj = {
      name: newTicketName,
      price,
      quantity: qty,
      startDate: newTicketStartDate,
      startTime: newTicketStartTime,
      endDate: newTicketEndDate,
      endTime: newTicketEndTime,
      whoCanBuy: newTicketWhoCanBuy,
      minQty: parseInt(newTicketMinQty || '1'),
      maxQty: parseInt(newTicketMaxQty || '5'),
      description: newTicketDesc,
      visible: newTicketVisibility,
    };

    if (editingTicketIndex !== null) {
      const updatedTickets = [...evTickets];
      updatedTickets[editingTicketIndex] = ticketObj;
      setEvTickets(updatedTickets);
      setTicketModalOpen(false);
      setEditingTicketIndex(null);
      Notiflix.Notify.success('Ingresso atualizado com sucesso!');
      return;
    }

    const updatedTickets = [...evTickets, ticketObj];

    // Auto-create meia-entrada if checked
    if (ticketModalType === 'paid' && newTicketMeiaEntrada) {
      updatedTickets.push({
        ...ticketObj,
        name: `Meia-Entrada - ${newTicketName}`,
        price: price / 2,
        description: `Meia-entrada aplicável conforme legislação vantagem para o ingresso: ${newTicketName}`,
      });
    }

    setEvTickets(updatedTickets);
    setTicketModalOpen(false);
    Notiflix.Notify.success('Ingresso adicionado com sucesso!');
  };

  const handleRemoveTicket = (index: number) => {
    setEvTickets((prev) => prev.filter((_, i) => i !== index));
    Notiflix.Notify.info('Ingresso removido.');
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeletingEvent(true);
    try {
      await axiosInstance.delete(`/event/${eventToDelete._id}`);
      Notiflix.Notify.success('Evento excluído com sucesso!');
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      loadMyEvents();
    } catch (err: any) {
      Notiflix.Notify.failure(err?.message || 'Erro ao excluir evento. Verifique se o evento tem vendas associadas.');
    } finally {
      setDeletingEvent(false);
    }
  };

  const handlePublishEvent = async () => {
    if (!evTermsAccepted) {
      Notiflix.Notify.failure('Você precisa aceitar os Termos de Responsabilidade para publicar.');
      return;
    }
    if (!evName || !evCategory || !evStartDate || !evStartTime) {
      Notiflix.Notify.failure('Preencha os campos obrigatórios (Nome, Categoria e Data de Início).');
      return;
    }
    if (evTickets.length === 0) {
      Notiflix.Notify.failure('Adicione pelo menos um tipo de ingresso para o evento.');
      return;
    }

    if (isEditingEvent && editingEventId) {
      setSubmittingEvent(true);
      try {
        const eventDate = new Date(`${evStartDate}T${evStartTime}:00`);
        const eventPayload = {
          name: evName,
          date: eventDate,
          additionalDates: evAdditionalDates.map(d => new Date(`${d}T${evStartTime}:00`)),
          description: evDescription,
          photo: evPhoto || undefined,
          local: evLocalType === 'online' ? 'Online' : evLocalName || 'Local a Definir',
          address: evLocalType === 'online' 
            ? 'Evento transmitido online' 
            : `${evStreet}, ${evNumber} ${evComplement ? `(${evComplement})` : ''} - ${evNeighborhood}, ${evCity} - ${evState} (CEP: ${evCEP})`,
          category: evCategory,
          producerName: evProducerName,
          producerLogo: user?.producerLogo || undefined,
          producerDescription: evProducerDescription,
          active: evVisibility === 'public',
          mapConfig: mapConfig.enabled ? mapConfig : undefined,
          endDate: evEndDate ? new Date(`${evEndDate}T${evEndTime}:00`) : undefined,
          subject: evSubject,
        };

        // 1. Update Event
        await axiosInstance.put(`/event/${editingEventId}`, eventPayload);

        // 2. Find or Create Category
        let categoryId = '';
        const existingTicket = evTickets.find(t => t._id);
        if (existingTicket) {
          try {
            const { data: prodData } = await axiosInstance.get(`/product/${existingTicket._id}`);
            categoryId = prodData.category;
          } catch (catErr) {
            console.warn('Failed to fetch category from existing product', catErr);
          }
        }

        if (!categoryId) {
          try {
            const { data: catData } = await axiosInstance.get(`/category`, {
              params: { event: editingEventId }
            });
            const categories = catData?.data || catData || [];
            if (categories.length > 0) {
              categoryId = categories[0]._id;
            }
          } catch (catFindErr) {
            console.warn('Failed to find existing category', catFindErr);
          }
        }

        if (!categoryId) {
          const { data: createdCategory } = await axiosInstance.post('/category', {
            name: 'Ingressos',
            event: editingEventId,
            active: true,
          });
          categoryId = createdCategory._id || createdCategory.data?._id;
        }

        // 3. Update / Create / Delete Tickets
        const currentTicketIds = evTickets.map(t => t._id).filter(Boolean);
        const deletedTicketIds = initialTicketIds.filter(id => !currentTicketIds.includes(id));

        await Promise.all(
          deletedTicketIds.map(id => axiosInstance.delete(`/product/${id}`))
        );

        // Save/Update current tickets
        await Promise.all(
          evTickets.map((ticket, idx) => {
            const productPayload = {
              event: editingEventId,
              category: categoryId,
              name: ticket.name,
              price: ticket.price,
              stock: ticket.quantity,
              description: ticket.description,
              validateQrcode: { enabled: true },
              active: ticket.visible ?? true,
              startDate: ticket.startDate && ticket.startTime ? new Date(`${ticket.startDate}T${ticket.startTime}:00`) : undefined,
              endDate: ticket.endDate && ticket.endTime ? new Date(`${ticket.endDate}T${ticket.endTime}:00`) : undefined,
              position: idx,
            };

            if (ticket._id) {
              return axiosInstance.put(`/product/${ticket._id}`, productPayload);
            } else {
              return axiosInstance.post('/product', productPayload);
            }
          })
        );

        Notiflix.Notify.success('Evento atualizado e enviado para análise!');
        setIsCreatingEvent(false);
        setIsEditingEvent(false);
        setEditingEventId(null);
        setCreateStep(0);
        clearForm();
        loadMyEvents();
      } catch (err: any) {
        console.error(err);
        Notiflix.Notify.failure(err?.message || 'Erro ao atualizar evento. Tente novamente.');
      } finally {
        setSubmittingEvent(false);
      }
      return;
    }

    setSubmittingEvent(true);
    try {
      const eventDate = new Date(`${evStartDate}T${evStartTime}:00`);
      const eventPayload = {
        name: evName,
        date: eventDate,
        additionalDates: evAdditionalDates.map(d => new Date(`${d}T${evStartTime}:00`)),
        description: evDescription,
        photo: evPhoto || undefined,
        local: evLocalType === 'online' ? 'Online' : evLocalName || 'Local a Definir',
        address: evLocalType === 'online' 
          ? 'Evento transmitido online' 
          : `${evStreet}, ${evNumber} ${evComplement ? `(${evComplement})` : ''} - ${evNeighborhood}, ${evCity} - ${evState} (CEP: ${evCEP})`,
        category: evCategory,
        producerName: evProducerName,
        producerLogo: user?.producerLogo || undefined,
        producerDescription: evProducerDescription,
        status: 'pending',
        active: false,
        mapConfig: mapConfig.enabled ? mapConfig : undefined,
        endDate: evEndDate ? new Date(`${evEndDate}T${evEndTime}:00`) : undefined,
        subject: evSubject,
      };

      // Create Event
      const { data: createdEvent } = await axiosInstance.post('/event', eventPayload);
      const eventId = createdEvent._id || createdEvent.data?._id;

      // Create Default Category for Tickets
      const { data: createdCategory } = await axiosInstance.post('/category', {
        name: 'Ingressos',
        event: eventId,
        active: true,
      });
      const categoryId = createdCategory._id || createdCategory.data?._id;

      // Create Tickets (Products)
      await Promise.all(
        evTickets.map((ticket, idx) =>
          axiosInstance.post('/product', {
            event: eventId,
            category: categoryId,
            name: ticket.name,
            price: ticket.price,
            stock: ticket.quantity,
            description: ticket.description,
            validateQrcode: { enabled: true },
            startDate: ticket.startDate && ticket.startTime ? new Date(`${ticket.startDate}T${ticket.startTime}:00`) : undefined,
            endDate: ticket.endDate && ticket.endTime ? new Date(`${ticket.endDate}T${ticket.endTime}:00`) : undefined,
            position: idx,
          })
        )
      );

      if (evSellProducts) {
        window.open(
          `https://wa.me/5541988917885?text=Olá! Quero vender produtos adicionais no meu evento: ${evName}`,
          '_blank'
        );
      }

      Notiflix.Notify.success('Evento criado e enviado para análise com sucesso!');
      localStorage.removeItem('nimbow_event_draft'); // Clear draft!
      setIsCreatingEvent(false);
      setCreateStep(0);
      
      // Reset form
      clearForm();

      loadMyEvents();
    } catch (err: any) {
      console.error(err);
      Notiflix.Notify.failure(err?.message || 'Erro ao publicar evento. Tente novamente.');
    } finally {
      setSubmittingEvent(false);
    }
  };

  const totalTicketsSold = extraData?.totalQuantity ?? orders.reduce((sum, ord) => {
    return sum + (ord.products || []).reduce((s: number, p: any) => s + (p.quantity || 0), 0);
  }, 0);

  const totalGrossRevenue = extraData?.totalValue ?? orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const nimbowFees = extraData?.totalTax ?? (totalGrossRevenue * 0.10);
  const totalNetRevenue = totalGrossRevenue - nimbowFees;

  const getLast7DaysSales = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();
    
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        dayLabel: days[d.getDay()],
        dateStr: d.toDateString(),
        value: 0
      };
    });

    orders.forEach((ord) => {
      if (!ord.createdAt) return;
      const orderDateStr = new Date(ord.createdAt).toDateString();
      const match = last7Days.find(item => item.dateStr === orderDateStr);
      if (match) {
        match.value += (ord.products || []).reduce((s: number, p: any) => s + (p.quantity || 0), 0);
      }
    });

    return last7Days;
  };

  const last7DaysData = getLast7DaysSales();
  const maxSales = Math.max(...last7DaysData.map(d => d.value), 1);

  // Filtered orders for Gestão Financeira
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = ord.event?.name?.toLowerCase().includes(financeSearch.toLowerCase()) || 
                          ord.number?.toString().includes(financeSearch);
    return matchesSearch;
  });

  // Removed "Lista de Interesse" tab as requested
  const sidebarTabs = [
    { label: 'Início', icon: 'carbon:home' },
    { label: 'Dados', icon: 'carbon:chart-line' },
    { label: 'Sua Página', icon: 'carbon:user-profile' },
    { label: 'Gestão Financeira', icon: 'carbon:wallet' },
  ];

  // Visual Light Theme Styling Guidelines - Harmonious and Refined
  const cardStyle = {
    bgcolor: '#ffffff',
    border: '1px solid #E5E7EB', // Softer border
    borderRadius: 2, // Less round (8px) for elegance
    color: '#111111',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
  };

  const darkInputStyle = {
    input: { color: '#111111' },
    textarea: { color: '#111111' },
    label: { color: '#6B7280' },
    '& .MuiOutlinedInput-root': {
      bgcolor: '#ffffff',
      '& fieldset': { borderColor: '#D1D5DB' },
      '&:hover fieldset': { borderColor: '#8E33FF' },
      '&.Mui-focused fieldset': { borderColor: '#8E33FF' },
    },
  };

  // Sub-renders
  const renderHeader = () => (
    <Box
      sx={{
        borderBottom: '3px solid #9BEA00',
        bgcolor: '#111111',
        py: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
            onClick={() => {
              setIsCreatingEvent(false);
              navigate(paths.tickets.root);
            }}
          >
            <Box
              component="img"
              src="/images/NIMBOW TICKETS - FUNDO ESCURO.png"
              alt="Nimbow Tickets"
              sx={{ height: { xs: 14, sm: 18, md: 20 }, objectFit: 'contain' }}
            />
            <Chip
              label="ÁREA DO PRODUTOR"
              size="small"
              sx={{
                bgcolor: '#9BEA00',
                color: '#000000',
                fontWeight: 800,
                fontSize: 9,
                height: 20,
                borderRadius: 0.5,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Desktop Navigation Button */}
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(paths.dashboard.root)}
              startIcon={<Icon icon="carbon:user" style={{ color: '#8E33FF' }} />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#8E33FF', color: '#8E33FF' },
              }}
            >
              Painel do Cliente
            </Button>

            {/* Mobile Navigation Icon Button */}
            <IconButton
              onClick={() => navigate(paths.dashboard.root)}
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                p: 0.6,
                '&:hover': { borderColor: '#8E33FF', color: '#8E33FF' },
              }}
            >
              <Icon icon="carbon:user" style={{ color: '#8E33FF', fontSize: 16 }} />
            </IconButton>

            <Box>
              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{
                  bgcolor: '#222222',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  p: 0.5,
                  '&:hover': { bgcolor: '#333333' },
                }}
              >
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#8E33FF', color: '#000000', fontWeight: 'bold', fontSize: 12 }}>
                  {producerName?.[0] || 'P'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: '#222222',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    mt: 1,
                    minWidth: 140,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <MenuItem onClick={() => { setUserMenuAnchor(null); navigate('/'); }} sx={{ fontSize: 13, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>Ver Portal</MenuItem>
                <MenuItem onClick={() => { setUserMenuAnchor(null); handleLogout(); }} sx={{ color: '#ff5630', fontSize: 13, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>Sair</MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );

  const renderTabInicio = () => {
    const greeting = () => {
      const hrs = new Date().getHours();
      if (hrs < 12) return 'Bom dia';
      if (hrs < 18) return 'Boa tarde';
      return 'Boa noite';
    };

    return (
      <Stack spacing={3}>
        {/* Header Greeting */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111111' }}>
            {greeting()}, {producerName.split(' ')[0]}!
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: 13.5 }}>
            Bem-vindo à sua central de gestão de eventos Nimbow. Acompanhe suas vendas e gerencie seus acessos.
          </Typography>
        </Box>

        {/* Action card */}
        <Card sx={{ ...cardStyle, p: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#111111' }}>
                Já publicou seu evento?
              </Typography>
              <Typography variant="body2" sx={{ color: '#4B5563', mb: 2, fontSize: 13 }}>
                Crie seu evento presencial agora com nossa plataforma de ingressos e gestão A&B integrada.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={handleStartCreateEvent}
                  startIcon={<Icon icon="carbon:add" />}
                  sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', px: 2.5, py: 1, '&:hover': { bgcolor: '#8ade00' } }}
                >
                  Criar evento presencial
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => Notiflix.Notify.info('Em breve: Venda de eventos online!')}
                  sx={{ borderColor: '#D1D5DB', color: '#374151', px: 2.5, py: 1, '&:hover': { borderColor: '#8E33FF', color: '#8E33FF' } }}
                >
                  Criar evento online
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Icon icon="carbon:calendar" width={76} style={{ color: 'rgba(142, 51, 255, 0.25)' }} />
            </Grid>
          </Grid>
        </Card>

        {/* Tab section: Meus Eventos */}
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: '#E5E7EB', mb: 2.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, borderBottom: '2px solid #8E33FF', display: 'inline-block', pb: 1, color: '#111111' }}>
              MEUS EVENTOS
            </Typography>
          </Box>

          {loadingEvents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#8E33FF' }} />
            </Box>
          ) : myEvents.length === 0 ? (
            <Card sx={{ ...cardStyle, p: 5, textAlign: 'center' }}>
              <Icon icon="carbon:calendar" width={40} style={{ color: 'rgba(0,0,0,0.15)', marginBottom: 12 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>
                Publique um evento pela primeira vez!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, mb: 2.5, maxWidth: 450, mx: 'auto', fontSize: 13 }}>
                Você tem total autonomia para cadastrar, gerenciar e acompanhar todas as informações do seu evento.
              </Typography>
              <Button
                variant="contained"
                onClick={handleStartCreateEvent}
                sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', '&:hover': { bgcolor: '#8ade00' } }}
              >
                Criar meu primeiro evento
              </Button>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {myEvents.map((evt) => (
                <Card key={evt._id} sx={{ ...cardStyle, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Box
                        component="img"
                        src={evt.photo || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80'}
                        sx={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 1, border: '1px solid #E5E7EB' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
                        {evt.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4B5563', display: 'block', mt: 0.3 }}>
                        {new Date(evt.date).toLocaleDateString('pt-BR', { dateStyle: 'medium' })} • {evt.local || 'Local a definir'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                        Categoria: {evt.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3.5} sx={{ textAlign: { sm: 'right' } }}>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.2,
                          py: 0.3,
                          borderRadius: 0.5,
                          fontSize: 10,
                          fontWeight: 'bold',
                          bgcolor: `${EVENT_STATUS_COLORS[evt.status] || '#888'}22`,
                          color: EVENT_STATUS_COLORS[evt.status] || '#888',
                          border: `1px solid ${EVENT_STATUS_COLORS[evt.status] || '#888'}44`,
                          mb: 1,
                        }}
                      >
                        {EVENT_STATUS_LABELS[evt.status] || evt.status}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1, alignItems: 'center' }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/event/${evt._id}`)}
                          endIcon={<Icon icon="carbon:arrow-right" />}
                          sx={{ color: '#8E33FF', fontWeight: 'bold', textTransform: 'none', fontSize: 12, p: 0, minWidth: 'auto' }}
                        >
                          Ver Evento
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleStartEditEvent(evt)}
                          sx={{
                            color: '#8E33FF',
                            bgcolor: 'rgba(142,51,255,0.06)',
                            border: '1px solid rgba(142,51,255,0.15)',
                            borderRadius: 1,
                            p: 0.6,
                            '&:hover': { bgcolor: 'rgba(142,51,255,0.12)' },
                          }}
                        >
                          <Icon icon="carbon:edit" width={15} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEventToDelete(evt);
                            setDeleteConfirmOpen(true);
                          }}
                          sx={{
                            color: '#dc2626',
                            bgcolor: 'rgba(220,38,38,0.06)',
                            border: '1px solid rgba(220,38,38,0.15)',
                            borderRadius: 1,
                            p: 0.6,
                            '&:hover': { bgcolor: 'rgba(220,38,38,0.12)' },
                          }}
                        >
                          <Icon icon="carbon:trash-can" width={15} />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    );
  };

  const renderTabDados = () => {
    if (myEvents.length === 0) {
      return (
        <Card sx={{ ...cardStyle, p: 6, textAlign: 'center' }}>
          <Icon icon="carbon:chart-line" width={44} style={{ color: 'rgba(0,0,0,0.15)', marginBottom: 12 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#111111' }}>
            Acompanhe seus dados de venda e otimize a estratégia do seu evento
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: 13 }}>
            Crie um evento para acessar o dashboard com relatórios, gráficos e analytics.
          </Typography>
        </Card>
      );
    }

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111111' }}>
            Analytics & Métricas
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: 13.5 }}>
            Dados consolidados de todos os seus eventos na plataforma.
          </Typography>
        </Box>

        {/* Metrics Grid */}
        <Grid container spacing={2}>
          {[
            { label: 'Eventos Criados', value: myEvents.length, icon: 'carbon:calendar', color: '#4B5563' },
            { label: 'Ingressos Vendidos', value: totalTicketsSold, icon: 'carbon:ticket', color: '#16a34a' },
            { label: 'Faturamento Bruto', value: `R$ ${totalGrossRevenue.toFixed(2)}`, icon: 'carbon:money', color: '#16a34a' },
            { label: 'Taxa Nimbow (10%)', value: `- R$ ${nimbowFees.toFixed(2)}`, icon: 'carbon:subtract', color: '#dc2626' },
            { label: 'Receita Líquida', value: `R$ ${totalNetRevenue.toFixed(2)}`, icon: 'carbon:wallet', color: '#2563eb' },
          ].map((kpi, index) => (
            <Grid item xs={index === 4 ? 12 : 6} sm={index < 3 ? 4 : 6} md={2.4} key={index}>
              <Card sx={{ ...cardStyle, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 1, borderRadius: 1.5, mb: 1, display: 'flex', alignItems: 'center' }}>
                  <Icon icon={kpi.icon} width={20} style={{ color: kpi.color }} />
                </Box>
                <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', fontSize: 11 }}>
                  {kpi.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: kpi.color, mt: 0.5, fontSize: 15 }}>
                  {kpi.value}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dynamic Charts Section */}
        <Card sx={{ ...cardStyle, p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#111111' }}>
            Desempenho de Vendas (Últimos 7 dias - Ingressos Vendidos)
          </Typography>
          <Box sx={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 2, pt: 3, px: 2 }}>
            {last7DaysData.map((d, i) => {
              const percentage = Math.min(100, Math.max(10, (d.value / maxSales) * 100));
              return (
                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#8E33FF', fontWeight: 'bold', fontSize: 10 }}>
                    {d.value}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${percentage}%`,
                      bgcolor: 'rgba(142, 51, 255, 0.6)',
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#8E33FF', transform: 'scaleY(1.05)' },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5, fontSize: 10 }}>
                    {d.dayLabel}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Card>
      </Stack>
    );
  };

  const renderTabSuaPagina = () => (
    <Card sx={{ ...cardStyle, p: 3.5 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111111' }}>
            Configurar Página do Produtor
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: 13 }}>
            Personalize o perfil público que os compradores visualizam ao buscar pelos seus eventos.
          </Typography>
        </Box>
        <Button
          onClick={handleSaveProducerProfile}
          disabled={savingProfile}
          variant="contained"
          sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', px: 3, '&:hover': { bgcolor: '#8ade00' } }}
        >
          {savingProfile ? <CircularProgress size={20} sx={{ color: '#000000' }} /> : 'Salvar e Publicar'}
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSaveProducerProfile}>
        <Stack spacing={3}>
          {/* Seção 1: Endereço */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
              1. Endereço da página
            </Typography>
            <TextField
              fullWidth
              label="URL da página (slug)"
              value={producerSlug}
              onChange={(e) => setProducerSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              placeholder="nome-do-organizador"
              sx={darkInputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 13 }}>
                      nimbowtickets.com.br/p/
                    </Typography>
                  </InputAdornment>
                ),
              }}
              helperText={`Link completo: nimbowtickets.com.br/p/${producerSlug || 'seu-slug'}`}
              FormHelperTextProps={{ sx: { color: '#8E33FF', fontWeight: 'bold', fontSize: 11 } }}
            />
          </Box>

          {/* Seção 2: Identidade */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
              2. Nome e imagem
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Organizador / Produtora"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  sx={darkInputStyle}
                />
              </Grid>

              {/* Upload Logo */}
              <Grid item xs={12} md={6}>
                <FormLabel sx={{ color: '#111111', mb: 1, display: 'block', fontWeight: 'bold', fontSize: 12 }}>
                  Logo do Produtor (Recomendado 136x136px)
                </FormLabel>
                <Box
                  onClick={() => logoInputRef.current?.click()}
                  sx={{
                    border: '1px dashed #D1D5DB',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'rgba(0,0,0,0.01)',
                    '&:hover': { borderColor: '#8E33FF', bgcolor: 'rgba(0,0,0,0.02)' },
                    transition: 'all 0.2s',
                    position: 'relative',
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {producerLogo ? (
                    <Box component="img" src={producerLogo} alt="Logo" sx={{ height: 80, width: 80, objectFit: 'cover', borderRadius: '50%', border: '2px solid #8E33FF' }} />
                  ) : (
                    <>
                      <Icon icon="carbon:upload" width={24} style={{ color: '#6B7280', marginBottom: 6 }} />
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>Clique para enviar o logo</Typography>
                    </>
                  )}
                </Box>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </Grid>

              {/* Upload Banner */}
              <Grid item xs={12} md={6}>
                <FormLabel sx={{ color: '#111111', mb: 1, display: 'block', fontWeight: 'bold', fontSize: 12 }}>
                  Banner de Fundo (Recomendado 1128x320px)
                </FormLabel>
                <Box
                  onClick={() => bannerInputRef.current?.click()}
                  sx={{
                    border: '1px dashed #D1D5DB',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: 'rgba(0,0,0,0.01)',
                    '&:hover': { borderColor: '#8E33FF', bgcolor: 'rgba(0,0,0,0.02)' },
                    transition: 'all 0.2s',
                    position: 'relative',
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {producerBanner ? (
                    <Box component="img" src={producerBanner} alt="Banner" sx={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 1 }} />
                  ) : (
                    <>
                      <Icon icon="carbon:upload" width={24} style={{ color: '#6B7280', marginBottom: 6 }} />
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>Clique para enviar o banner</Typography>
                    </>
                  )}
                </Box>
                <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
              </Grid>
            </Grid>
          </Box>

          {/* Seção 3: Descrição */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
              3. Descrição
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Sobre o Produtor / Empresa"
              placeholder="Escreva uma breve biografia ou informações para os clientes que acessam a sua página pública..."
              value={producerDescription}
              onChange={(e) => setProducerDescription(e.target.value)}
              sx={darkInputStyle}
            />
          </Box>

          {/* Seção 4: Avançado */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', borderBottom: '1px solid #E5E7EB', pb: 1, mb: 1.5 }}>
              4. Configurações avançadas
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8E33FF' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8E33FF' },
                  }}
                />
              }
              label={<Typography variant="body2" sx={{ color: '#374151', fontSize: 13 }}>Mostrar eventos passados na minha página pública</Typography>}
            />
          </Box>
        </Stack>
      </Box>
    </Card>
  );

  const renderTabGestaoFinanceira = () => (
    <Card sx={{ ...cardStyle, p: 3.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#111111' }}>
          Gestão Financeira
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5, fontSize: 13 }}>
          Selecione um evento ou filtre por transações para obter detalhes de receitas e vendas.
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          label="Buscar pelo nome do evento ou ID"
          value={financeSearch}
          onChange={(e) => setFinanceSearch(e.target.value)}
          sx={{ ...darkInputStyle, flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="carbon:search" style={{ color: '#6B7280', width: 16 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          size="small"
          select
          label="Status"
          value={financeStatus}
          onChange={(e) => setFinanceStatus(e.target.value)}
          sx={{ ...darkInputStyle, width: 160 }}
        >
          <MenuItem value="all">Todos os eventos</MenuItem>
          <MenuItem value="active">Apenas Ativos</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={() => Notiflix.Notify.success('Filtros aplicados!')}
          sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', fontSize: 13, px: 2.5, '&:hover': { bgcolor: '#8ade00' } }}
        >
          Filtrar
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setFinanceSearch('');
            setFinanceStatus('all');
            Notiflix.Notify.info('Filtros limpos!');
          }}
          sx={{ color: '#374151', fontSize: 13, '&:hover': { color: '#8E33FF' } }}
        >
          Limpar filtros
        </Button>
      </Box>

      {/* Summary Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Receita Bruta', value: `R$ ${totalGrossRevenue.toFixed(2)}`, color: '#16a34a', icon: 'carbon:chart-line-smooth' },
          { label: 'Taxa Nimbow (10%)', value: `- R$ ${nimbowFees.toFixed(2)}`, color: '#dc2626', icon: 'carbon:subtract' },
          { label: 'Receita Líquida (A Receber)', value: `R$ ${totalNetRevenue.toFixed(2)}`, color: '#2563eb', icon: 'carbon:wallet' },
        ].map((item, idx) => (
          <Grid item xs={idx === 2 ? 12 : 6} sm={4} key={idx}>
            <Card sx={{ bgcolor: '#f9fafb', border: '1px solid #E5E7EB', p: 2, borderRadius: 1.5, textAlign: 'center' }}>
              <Icon icon={item.icon} width={22} style={{ color: item.color, marginBottom: 4 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: item.color, fontSize: 16 }}>
                {item.value}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.2, display: 'block', fontSize: 11 }}>
                {item.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Orders Table */}
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#111111' }}>
        Histórico de Vendas Recentes
      </Typography>
      {loadingOrders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#8E33FF' }} />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: '#6B7280', fontSize: 13 }}>
          Nenhuma transação financeira correspondente encontrada.
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Pedido', 'Evento', 'Ingressos', 'Valor Total', 'Data'].map((h) => (
                  <TableCell key={h} sx={{ color: '#4B5563', fontWeight: 'bold', py: 1.2, borderBottom: 'none', fontSize: 12 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((ord) => (
                <TableRow key={ord._id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' }, borderBottom: '1px solid #F3F4F6' }}>
                  <TableCell sx={{ color: '#8E33FF', borderBottom: 'none', fontWeight: 'bold', py: 1.2, fontSize: 13 }}>
                    #{ord.number}
                  </TableCell>
                  <TableCell sx={{ color: '#111111', borderBottom: 'none', fontWeight: 'bold', py: 1.2, fontSize: 13 }}>
                    {ord.event?.name || '—'}
                  </TableCell>
                  <TableCell sx={{ color: '#4B5563', borderBottom: 'none', py: 1.2, fontSize: 13 }}>
                    {(ord.products || []).reduce((s: number, p: any) => s + (p.quantity || 0), 0)} und.
                  </TableCell>
                  <TableCell sx={{ color: '#16a34a', fontWeight: 'bold', borderBottom: 'none', py: 1.2, fontSize: 13 }}>
                    R$ {(ord.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: '#6B7280', borderBottom: 'none', py: 1.2, fontSize: 12 }}>
                    {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Card>
  );

  const renderCreateEventFlow = () => {
    // Helper to get unique producers from user info and previous events
    const getUniqueProducers = () => {
      const profiles: Array<{ name: string; description: string }> = [];

      // Add current user info
      const userProfileName = user?.producerName || user?.name || '';
      const userProfileDesc = user?.producerDescription || '';
      if (userProfileName) {
        profiles.push({ name: userProfileName, description: userProfileDesc });
      }

      // Add from existing events list
      myEvents.forEach((evt: any) => {
        if (evt.producerName && evt.producerName.trim()) {
          const nameClean = evt.producerName.trim();
          const exists = profiles.some(p => p.name.toLowerCase() === nameClean.toLowerCase());
          if (!exists) {
            profiles.push({
              name: nameClean,
              description: evt.producerDescription || ''
            });
          }
        }
      });

      return profiles;
    };

    const uniqueProducers = getUniqueProducers();
    const matchedProducer = uniqueProducers.find(p => p.name === evProducerName);
    const selectProducerValue = matchedProducer ? matchedProducer.name : '';

    const steps = [
      'Informações Básicas',
      'Data e Horário',
      'Descrição',
      'Localização',
      'Ingressos',
      'Sobre o Produtor',
      'Responsabilidades',
    ];

    const stepContent = [
      // Step 0: Informações Básicas
      <Stack spacing={3} key="basic">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          1. Informações básicas do seu evento
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do evento *"
              placeholder="Ex: Show Sertanejo Nimbow Fest"
              value={evName}
              onChange={(e) => setEvName(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Assunto *"
              value={evSubject}
              onChange={(e) => setEvSubject(e.target.value)}
              sx={darkInputStyle}
            >
              {EVENT_SUBJECTS.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Categoria (opcional)"
              value={evCategory}
              onChange={(e) => setEvCategory(e.target.value)}
              sx={darkInputStyle}
            >
              {EVENT_CATEGORIES.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <FormLabel sx={{ color: '#111111', mb: 1, display: 'block', fontWeight: 'bold', fontSize: 12 }}>
              Imagem de divulgação (Recomendado 1600x838px)
            </FormLabel>
            <Box
              onClick={() => eventPhotoInputRef.current?.click()}
              sx={{
                border: '1px dashed #D1D5DB',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'rgba(0,0,0,0.01)',
                '&:hover': { borderColor: '#8E33FF', bgcolor: 'rgba(0,0,0,0.02)' },
                transition: 'all 0.2s',
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {evPhoto ? (
                <Box component="img" src={evPhoto} alt="Event Cover" sx={{ height: '100%', objectFit: 'contain', borderRadius: 1 }} />
              ) : (
                <>
                  <Icon icon="carbon:image" width={32} style={{ color: '#6B7280', marginBottom: 6 }} />
                  <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 13 }}>Clique ou arraste a imagem aqui</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', mt: 0.5, fontSize: 11 }}>Formatos aceitos: JPEG, GIF ou PNG de até 2MB</Typography>
                </>
              )}
            </Box>
            <input ref={eventPhotoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEventPhotoUpload} />
          </Grid>
        </Grid>
      </Stack>,

      // Step 1: Data e Horário
      <Stack spacing={3} key="dates">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          2. Data e horário do evento
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data de Início *"
              InputLabelProps={{ shrink: true }}
              value={evStartDate}
              onChange={(e) => setEvStartDate(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Hora de Início *"
              InputLabelProps={{ shrink: true }}
              value={evStartTime}
              onChange={(e) => setEvStartTime(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data de Término *"
              InputLabelProps={{ shrink: true }}
              value={evEndDate}
              onChange={(e) => setEvEndDate(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Hora de Término *"
              InputLabelProps={{ shrink: true }}
              value={evEndTime}
              onChange={(e) => setEvEndTime(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>

          {/* Datas Adicionais */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#111111', mt: 2 }}>Datas Adicionais (Opcional)</Typography>
            <Stack spacing={1}>
              {evAdditionalDates.map((d, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <TextField type="date" size="small" value={d} onChange={(e) => {
                    const newDates = [...evAdditionalDates];
                    newDates[i] = e.target.value;
                    setEvAdditionalDates(newDates);
                  }} sx={{ ...darkInputStyle, flexGrow: 1 }} />
                  <IconButton color="error" onClick={() => setEvAdditionalDates(evAdditionalDates.filter((_, idx) => idx !== i))}>
                    <Icon icon="carbon:trash-can" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" variant="outlined" startIcon={<Icon icon="carbon:add" />} onClick={() => setEvAdditionalDates([...evAdditionalDates, ''])} sx={{ width: 'max-content', mt: 1 }}>
                Adicionar Nova Data
              </Button>
            </Stack>
          </Grid>

        </Grid>
      </Stack>,

      // Step 2: Descrição
      <Stack spacing={3} key="desc">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          3. Descrição do evento
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={8}
          label="Conte todos os detalhes do seu evento..."
          placeholder="Escreva a programação, atrações, regras de entrada e os diferenciais da sua produção..."
          value={evDescription}
          onChange={(e) => setEvDescription(e.target.value)}
          sx={darkInputStyle}
        />
      </Stack>,

      // Step 3: Localização
      <Stack spacing={3} key="local">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          4. Onde o seu evento vai acontecer?
        </Typography>
        <RadioGroup
          row
          value={evLocalType}
          onChange={(e) => setEvLocalType(e.target.value as 'presencial' | 'online')}
          sx={{ mb: 1 }}
        >
          <FormControlLabel value="presencial" control={<Radio size="small" sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }} />} label={<span style={{ color: '#111111', fontSize: 13.5 }}>Presencial</span>} />
          <FormControlLabel value="online" control={<Radio size="small" sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }} />} label={<span style={{ color: '#111111', fontSize: 13.5 }}>Online (Transmissão via link)</span>} />
        </RadioGroup>

        {evLocalType === 'presencial' ? (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome do local *"
                placeholder="Ex: Arena Nimbow, Pedreira, etc."
                value={evLocalName}
                onChange={(e) => setEvLocalName(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CEP"
                placeholder="00000-000"
                value={evCEP}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 8) {
                    const formatted = val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val;
                    setEvCEP(formatted);
                  }
                }}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Endereço / Av. / Rua *"
                value={evStreet}
                onChange={(e) => setEvStreet(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                value={evNumber}
                onChange={(e) => setEvNumber(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={evComplement}
                onChange={(e) => setEvComplement(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={evNeighborhood}
                onChange={(e) => setEvNeighborhood(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Cidade *"
                value={evCity}
                onChange={(e) => setEvCity(e.target.value)}
                sx={darkInputStyle}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estado *"
                value={evState}
                onChange={(e) => setEvState(e.target.value.toUpperCase())}
                inputProps={{ maxLength: 2 }}
                sx={darkInputStyle}
              />
            </Grid>
          </Grid>
        ) : (
          <TextField
            fullWidth
            label="Link da Transmissão (Zoom, YouTube, etc.)"
            placeholder="https://youtube.com/live/..."
            sx={darkInputStyle}
          />
        )}
      </Stack>,

      // Step 4: Ingressos
      <Stack spacing={3} key="tickets">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          5. Ingressos do evento
        </Typography>

        <Card sx={{ bgcolor: '#f9fafb', p: 2.5, border: '1px solid #E5E7EB', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#4b5563', mb: 2, fontSize: 13 }}>
            O que você deseja criar? Adicione quantos ingressos ou lotes achar necessário.
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => handleOpenAddTicket('paid')}
              startIcon={<Icon icon="carbon:add" />}
              sx={{ borderColor: '#9BEA00', color: '#79b800', fontSize: 13, '&:hover': { borderColor: '#8ade00', bgcolor: 'rgba(155, 234, 0, 0.04)' } }}
            >
              + INGRESSO PAGO
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleOpenAddTicket('free')}
              startIcon={<Icon icon="carbon:add" />}
              sx={{ borderColor: '#4b5563', color: '#4b5563', fontSize: 13, '&:hover': { borderColor: '#111111', bgcolor: 'rgba(0, 0, 0, 0.02)' } }}
            >
              + INGRESSO GRATUITO
            </Button>
          </Stack>
        </Card>

        {evTickets.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', mb: 1, fontSize: 13 }}>
              Ingressos Criados:
            </Typography>
            <Stack spacing={1}>
              {evTickets.map((t, idx) => (
                <Card
                  key={idx}
                  draggable
                  onDragStart={(e) => handleTicketDragStart(e, idx)}
                  onDragOver={(e) => handleTicketDragOver(e, idx)}
                  onDragEnd={handleTicketDragEnd}
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #E5E7EB',
                    p: 1.5,
                    borderRadius: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    opacity: draggedTicketIndex === idx ? 0.4 : 1,
                    boxShadow: draggedTicketIndex === idx ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                    '&:active': { cursor: 'grabbing' },
                    '&:hover': {
                      borderColor: '#8E33FF',
                      boxShadow: '0 4px 12px rgba(142,51,255,0.08)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: 'text.secondary',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' }
                      }}
                    >
                      <Icon icon="carbon:row-drag" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111' }}>{t.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#4b5563' }}>
                        {t.price === 0 ? 'Gratuito' : `R$ ${t.price.toFixed(2)}`} • Estoque: {t.quantity}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" sx={{ color: '#8E33FF' }} onClick={(e) => { e.stopPropagation(); handleOpenEditTicket(idx); }}>
                      <Icon icon="carbon:edit" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveTicket(idx); }}>
                      <Icon icon="carbon:trash-can" />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ bgcolor: 'rgba(217, 119, 6, 0.05)', color: '#d97706', py: 0.5, border: '1px solid rgba(217,119,6,0.15)', '& .MuiAlert-icon': { color: '#d97706' } }}>
            Adicione pelo menos um tipo de ingresso para poder prosseguir.
          </Alert>
        )}

        {/* Configurations */}
        <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={evAbsorbFee}
                onChange={(e) => setEvAbsorbFee(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#8E33FF' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8E33FF' },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>Absorver a taxa de serviço (10%)</Typography>
                <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 11 }}>A taxa Nimbow será descontada do seu recebimento líquido</Typography>
              </Box>
            }
          />
          <TextField
            select
            label="Nomenclatura"
            value={evTicketNomenclature}
            onChange={(e) => setEvTicketNomenclature(e.target.value)}
            sx={{ ...darkInputStyle, width: 180 }}
            size="small"
          >
            {NOMENCLATURES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Stack>

        <FormControlLabel
          control={
            <Checkbox
              checked={evSellProducts}
              onChange={(e) => setEvSellProducts(e.target.checked)}
              size="small"
              sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>Quero vender produtos adicionais (bebidas, combos, copos)!</Typography>
              <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 11 }}>Selecione para ativar a loja do evento ao finalizar.</Typography>
            </Box>
          }
        />

        {/* ─── Seat Map Builder ─── */}
        <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid #E5E7EB' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', mb: 2, fontSize: 13 }}>
            Mapa de Assentos / Setores Interativo (opcional)
          </Typography>
          <SeatMapBuilder
            mapConfig={mapConfig}
            onChange={setMapConfig}
            tickets={evTickets.map((t, idx) => ({ id: `ticket_${idx}`, name: t.name, price: t.price }))}
            darkInputStyle={darkInputStyle}
          />
        </Box>
      </Stack>,

      // Step 5: Sobre o Produtor
      <Stack spacing={3} key="producer">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          6. Sobre o produtor do evento
        </Typography>
        {uniqueProducers.length > 0 && (
          <Grid container spacing={2.5} sx={{ mb: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                size="small"
                label="Carregar Perfil de Produtor"
                value={selectProducerValue}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedProf = uniqueProducers.find((p) => p.name === selectedName);
                  if (selectedProf) {
                    setEvProducerName(selectedProf.name);
                    setEvProducerDescription(selectedProf.description);
                  } else {
                    setEvProducerName('');
                    setEvProducerDescription('');
                  }
                }}
                sx={darkInputStyle}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) => (value === '' ? 'Novo produtor / Personalizado' : (value as string)),
                }}
              >
                <MenuItem value="" sx={{ fontSize: 13, fontWeight: 'bold', color: '#8E33FF' }}>
                  -- Novo produtor / Personalizado --
                </MenuItem>
                {uniqueProducers.map((p) => (
                  <MenuItem key={p.name} value={p.name} sx={{ fontSize: 13 }}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do produtor / produtora *"
              value={evProducerName}
              onChange={(e) => setEvProducerName(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição do produtor (opcional)"
              placeholder="Descreva brevemente quem está organizando..."
              value={evProducerDescription}
              onChange={(e) => setEvProducerDescription(e.target.value)}
              sx={darkInputStyle}
            />
          </Grid>
        </Grid>
      </Stack>,

      // Step 6: Responsabilidades
      <Stack spacing={3} key="publish">
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
          7. Responsabilidades e visibilidade
        </Typography>

        <Card sx={{ bgcolor: '#f9fafb', border: '1px solid #E5E7EB', p: 2.5, borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#111111' }}>
            Visibilidade do evento
          </Typography>
          <RadioGroup
            value={evVisibility}
            onChange={(e) => setEvVisibility(e.target.value as 'public' | 'private')}
          >
            <FormControlLabel
              value="public"
              control={<Radio size="small" sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>Público (Recomendado)</Typography>
                  <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 11 }}>Visível na busca do portal Nimbow Tickets e aberto a indexação.</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="private"
              control={<Radio size="small" sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }} />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>Privado</Typography>
                  <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 11 }}>Apenas pessoas com o link exclusivo do evento conseguirão acessar e comprar.</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Card>

        <FormControlLabel
          control={
            <Checkbox
              checked={evTermsAccepted}
              onChange={(e) => setEvTermsAccepted(e.target.checked)}
              size="small"
              sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#4b5563', pl: 1, fontSize: 12.5 }}>
              Ao publicar este evento, declaro estar de acordo com os{' '}
              <span style={{ color: '#8E33FF', fontWeight: 'bold', cursor: 'pointer' }}>Termos de Uso</span>,{' '}
              <span style={{ color: '#8E33FF', fontWeight: 'bold', cursor: 'pointer' }}>Regras de Meia-Entrada</span> e ciente da{' '}
              <span style={{ color: '#8E33FF', fontWeight: 'bold', cursor: 'pointer' }}>Política de Privacidade</span> da Nimbow.
            </Typography>
          }
        />
      </Stack>,
    ];

    return (
      <Card sx={{ ...cardStyle, p: 3.5, mb: 3 }}>
        {/* Step Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            {steps.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: i === createStep ? '#8E33FF' : i < createStep ? '#9BEA00' : '#e5e7eb',
                    color: i === createStep ? '#ffffff' : i < createStep ? '#000000' : '#6b7280',
                    fontWeight: 'bold',
                    fontSize: 12,
                    boxShadow: i === createStep ? '0 0 8px rgba(142, 51, 255, 0.4)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {i + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: i === createStep ? 'bold' : 'normal',
                    color: i === createStep ? '#111111' : '#4b5563',
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  {s}
                </Typography>
                {i < steps.length - 1 && (
                  <Typography sx={{ color: '#D1D5DB', fontWeight: 'bold', fontSize: 14, display: { xs: 'none', md: 'block' } }}>
                    {'>'}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          {/* Active Step Name on Mobile */}
          <Typography
            variant="subtitle2"
            align="center"
            sx={{ display: { xs: 'block', md: 'none' }, fontWeight: 'bold', color: '#8E33FF' }}
          >
            Passo {createStep + 1} de {steps.length}: {steps[createStep]}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ minHeight: 250 }}>{stepContent[createStep]}</Box>

        {/* Actions Bottom Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2.5, borderTop: '1px solid #E5E7EB' }}>
          <Button
            variant="text"
            disabled={createStep === 0}
            onClick={() => setCreateStep((s) => s - 1)}
            sx={{ color: '#111111', fontSize: 13, '&:hover': { color: '#8E33FF' } }}
          >
            Voltar
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsCreatingEvent(false);
                setCreateStep(0);
              }}
              sx={{ borderColor: '#D1D5DB', color: '#374151', fontSize: 13, '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}
            >
              Cancelar
            </Button>
            {createStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => {
                  if (createStep === 0 && !evName) {
                    Notiflix.Notify.warning('O nome do evento é obrigatório.');
                    return;
                  }
                  if (createStep === 1 && !evStartDate) {
                    Notiflix.Notify.warning('A data de início do evento é obrigatória.');
                    return;
                  }
                  setCreateStep((s) => s + 1);
                }}
                sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', fontSize: 13, '&:hover': { bgcolor: '#8ade00' } }}
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handlePublishEvent}
                disabled={submittingEvent}
                sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', fontSize: 13, '&:hover': { bgcolor: '#8ade00' } }}
              >
                {submittingEvent ? (
                  <CircularProgress size={18} sx={{ color: '#000000' }} />
                ) : isEditingEvent ? (
                  'Salvar Alterações'
                ) : (
                  'Publicar Evento'
                )}
              </Button>
            )}
          </Stack>
        </Box>
      </Card>
    );
  };

  const renderTicketModal = () => {
    const rawPrice = parseFloat(newTicketPrice || '0');
    const finalParticipantPrice = evAbsorbFee ? rawPrice : rawPrice * 1.10;
    const feeCollected = rawPrice * 0.10;
    const netProducerRevenue = evAbsorbFee ? rawPrice - feeCollected : rawPrice;

    return (
      <Dialog
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            color: '#111111',
            border: '1px solid #E5E7EB',
            p: 1,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#111111', fontSize: 18 }}>
          {editingTicketIndex !== null ? 'Editar ingresso' : 'Criar ingresso'} {ticketModalType === 'free' ? 'gratuito' : 'pago'}
          <IconButton size="small" onClick={() => setTicketModalOpen(false)} sx={{ color: '#111111' }}>
            <Icon icon="carbon:close" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#E5E7EB', py: 2 }}>
          {ticketModalType === 'paid' && (
            <Alert severity="info" sx={{ bgcolor: 'rgba(142, 51, 255, 0.05)', py: 0.5, fontSize: 12.5, color: '#61a800', border: '1px solid rgba(142, 51, 255, 0.15)', mb: 2, '& .MuiAlert-icon': { color: '#61a800' } }}>
              A taxa de serviço (10%) será {evAbsorbFee ? 'absorvida por você e deduzida do repasse' : 'repassada ao comprador'}.
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              label="Título do ingresso *"
              placeholder="Ex: Pista Lote 1, VIP Unissex"
              value={newTicketName}
              onChange={(e) => setNewTicketName(e.target.value)}
              sx={darkInputStyle}
            />
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Quantidade *"
                placeholder="100"
                value={newTicketQty}
                onChange={(e) => setNewTicketQty(e.target.value)}
                sx={{ ...darkInputStyle, flex: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                type={ticketModalType === 'free' ? 'text' : 'number'}
                disabled={ticketModalType === 'free'}
                label="Valor a receber *"
                placeholder="R$ 0,00"
                value={ticketModalType === 'free' ? 'Grátis' : newTicketPrice}
                onChange={(e) => setNewTicketPrice(e.target.value)}
                sx={{ ...darkInputStyle, flex: 1 }}
              />
            </Stack>

            {ticketModalType === 'paid' && (
              <Card sx={{ bgcolor: '#f9fafb', p: 2, border: '1px solid #E5E7EB', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block', color: '#8E33FF', fontSize: 12 }}>
                  Resumo Financeiro por Unidade
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 12 }}>Valor do Ingresso:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 12 }}>R$ {rawPrice.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#4b5563', fontSize: 12 }}>Taxa Nimbow (10%):</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#dc2626', fontSize: 12 }}>R$ {feeCollected.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 12 }}>Valor pago pelo Participante:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#8E33FF', fontSize: 12 }}>R$ {finalParticipantPrice.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 12 }}>Seu repasse líquido:</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#16a34a', fontSize: 12 }}>R$ {netProducerRevenue.toFixed(2)}</Typography>
                  </Grid>
                </Grid>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newTicketMeiaEntrada}
                      onChange={(e) => setNewTicketMeiaEntrada(e.target.checked)}
                      size="small"
                      sx={{ color: 'rgba(0,0,0,0.3)', '&.Mui-checked': { color: '#8E33FF' } }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: '#4b5563', fontSize: 11.5 }}>Criar versão de Meia-Entrada (50% do valor)</Typography>}
                  sx={{ mt: 1.5 }}
                />
              </Card>
            )}

            {/* Sales Period */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', display: 'block', mb: 1, fontSize: 12 }}>
                Período de vendas
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Início das vendas"
                    InputLabelProps={{ shrink: true }}
                    value={newTicketStartDate}
                    onChange={(e) => setNewTicketStartDate(e.target.value)}
                    sx={{ ...darkInputStyle, flex: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    label="Hora de início"
                    InputLabelProps={{ shrink: true }}
                    value={newTicketStartTime}
                    onChange={(e) => setNewTicketStartTime(e.target.value)}
                    sx={{ ...darkInputStyle, flex: 1 }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Fim das vendas"
                    InputLabelProps={{ shrink: true }}
                    value={newTicketEndDate}
                    onChange={(e) => setNewTicketEndDate(e.target.value)}
                    sx={{ ...darkInputStyle, flex: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    label="Hora de término"
                    InputLabelProps={{ shrink: true }}
                    value={newTicketEndTime}
                    onChange={(e) => setNewTicketEndTime(e.target.value)}
                    sx={{ ...darkInputStyle, flex: 1 }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Quantities per purchase */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', display: 'block', mb: 1, fontSize: 12 }}>
                Limites de compra por participante
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Mínimo por compra"
                  value={newTicketMinQty}
                  onChange={(e) => setNewTicketMinQty(e.target.value)}
                  sx={{ ...darkInputStyle, flex: 1 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Máximo por compra"
                  value={newTicketMaxQty}
                  onChange={(e) => setNewTicketMaxQty(e.target.value)}
                  sx={{ ...darkInputStyle, flex: 1 }}
                />
              </Stack>
            </Box>

            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Descrição do ingresso (opcional)"
              placeholder="Ex: Dá direito a um copo exclusivo na entrada..."
              value={newTicketDesc}
              onChange={(e) => setNewTicketDesc(e.target.value)}
              sx={darkInputStyle}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newTicketVisibility}
                  onChange={(e) => setNewTicketVisibility(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8E33FF' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8E33FF' },
                  }}
                />
              }
              label={<Typography variant="caption" sx={{ color: '#111111', fontSize: 12.5 }}>Ingresso Visível na página do evento</Typography>}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f9fafb', gap: 1 }}>
          <Button onClick={() => setTicketModalOpen(false)} sx={{ color: '#4b5563', fontSize: 13, fontWeight: 'bold' }}>
            CANCELAR
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTicket}
            sx={{ bgcolor: '#9BEA00', color: '#111111', fontWeight: 'bold', fontSize: 13, px: 3, '&:hover': { bgcolor: '#8ade00' } }}
          >
            {editingTicketIndex !== null ? 'SALVAR INGRESSO' : 'CRIAR INGRESSO'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F5F7', color: '#111111', display: 'flex', flexDirection: 'column' }}>
      {renderHeader()}

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {isCreatingEvent ? (
          renderCreateEventFlow()
        ) : (
          <Grid container spacing={{ xs: 0, md: 3 }}>
            {/* Sidebar - Compact, Harmonious & Elegant */}
            <Grid item xs={12} md={3} sx={{ maxWidth: { md: 240 }, display: { xs: 'none', md: 'block' } }}>
              <Card sx={{ p: 1.5, borderRadius: '24px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)' }}>
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
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
                  {sidebarTabs.map((tab) => (
                    <Tab
                      key={tab.label}
                      label={tab.label}
                      icon={<Icon icon={tab.icon} width={18} style={{ color: 'inherit' }} />}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Card>
            </Grid>

            {/* Tab content area */}
            <Grid item xs={12} md={9} sx={{ flexGrow: 1 }}>
              {isMobile && (
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={activeTab}
                      onChange={(e) => setActiveTab(Number(e.target.value))}
                      displayEmpty
                      sx={{
                        bgcolor: '#ffffff',
                        borderRadius: 1.5,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        border: '1px solid #E5E7EB',
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#111111',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.2,
                        }
                      }}
                      renderValue={(selected: any) => {
                        const tab = sidebarTabs[selected];
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Icon icon={tab.icon} style={{ fontSize: 20, color: '#8E33FF' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{tab.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {sidebarTabs.map((tab, index) => (
                        <MenuItem
                          key={tab.label}
                          value={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.5,
                            fontSize: 14,
                            fontWeight: activeTab === index ? 'bold' : 'normal',
                            color: activeTab === index ? '#8E33FF' : '#4B5563',
                            bgcolor: activeTab === index ? 'rgba(142, 51, 255, 0.04)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(142, 51, 255, 0.06)' },
                          }}
                        >
                          <Icon icon={tab.icon} style={{ fontSize: 20, color: activeTab === index ? '#8E33FF' : '#6B7280' }} />
                          {tab.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {activeTab === 0 && renderTabInicio()}
              {activeTab === 1 && renderTabDados()}
              {activeTab === 2 && renderTabSuaPagina()}
              {activeTab === 3 && renderTabGestaoFinanceira()}
            </Grid>
          </Grid>
        )}
      </Container>

      {renderTicketModal()}

      {/* Dialog Confirmar Exclusão de Evento */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deletingEvent && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1, color: '#111111' }}>
          Excluir Evento
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#4B5563' }}>
            Tem certeza que deseja excluir o evento <strong>{eventToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#dc2626', mt: 1, fontSize: 13, fontWeight: 500 }}>
            Esta ação não pode ser desfeita e todas as vendas associadas devem ter sido resolvidas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deletingEvent}
            sx={{ color: '#6B7280', fontWeight: 'bold' }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleDeleteEvent}
            disabled={deletingEvent}
            variant="contained"
            sx={{
              bgcolor: '#dc2626',
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#b91c1c' },
            }}
          >
            {deletingEvent ? <CircularProgress size={20} color="inherit" /> : 'EXCLUIR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Restauração de Rascunho */}
      <Dialog
        open={draftConfirmOpen}
        onClose={() => setDraftConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            bgcolor: '#ffffff',
            color: '#111111',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid #E5E7EB',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#8E33FF', fontSize: 20, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon="carbon:document-import" style={{ fontSize: 24, color: '#8E33FF' }} /> Restaurar Rascunho
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6, fontSize: 14 }}>
            Você possui um rascunho salvo de um evento preenchido anteriormente. Deseja recuperar essas informações e continuar de onde parou?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem('nimbow_event_draft');
              clearForm();
              setIsEditingEvent(false);
              setEditingEventId(null);
              setDraftConfirmOpen(false);
              setIsCreatingEvent(true);
            }}
            sx={{
              borderColor: '#D1D5DB',
              color: '#374151',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: 13,
              '&:hover': { borderColor: '#8E33FF', color: '#8E33FF', bgcolor: 'rgba(142,51,255,0.05)' },
            }}
          >
            Não, começar do zero
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (pendingDraft) {
                restoreDraft(pendingDraft);
              }
              setIsEditingEvent(false);
              setEditingEventId(null);
              setDraftConfirmOpen(false);
              setIsCreatingEvent(true);
            }}
            sx={{
              bgcolor: '#9BEA00',
              color: '#111111',
              fontWeight: 800,
              px: 3,
              py: 1.2,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(155,234,0,0.2)',
              '&:hover': { bgcolor: '#8ade00', boxShadow: '0 6px 16px rgba(155,234,0,0.3)' },
            }}
          >
            Sim, restaurar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
