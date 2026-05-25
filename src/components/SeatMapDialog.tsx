import { useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Grid,
  Divider,
  LinearProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { MapConfig } from './SeatMapBuilder';

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface Ticket {
  _id: string;
  name: string;
  price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  mapConfig: MapConfig;
  tickets: Ticket[];
  // seats already occupied (from backend or session)
  occupiedSeats?: string[];
  onConfirm: (seats: Record<string, string[]>) => void; // ticketId → seatIds[]
}

export default function SeatMapDialog({ open, onClose, mapConfig, tickets, occupiedSeats = [], onConfirm }: Props) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const getRows = () => {
    const maxIdx = ROW_LETTERS.indexOf((mapConfig.gridRows || 'E').toUpperCase());
    return ROW_LETTERS.slice(0, maxIdx + 1).split('');
  };

  const getTicketForSeat = useCallback((seatId: string): Ticket | undefined => {
    const ticketId = mapConfig.seatAssignments?.[seatId];
    if (!ticketId) return undefined;
    return tickets.find((t) => t._id === ticketId);
  }, [mapConfig, tickets]);

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;
    const ticket = getTicketForSeat(seatId);
    if (!ticket && mapConfig.type !== 'sectors') return; // unassigned seats can't be selected

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleConfirm = () => {
    // Group selected seats by ticket ID
    const grouped: Record<string, string[]> = {};
    selectedSeats.forEach((seatId) => {
      const ticketId = mapConfig.seatAssignments?.[seatId];
      if (ticketId) {
        if (!grouped[ticketId]) grouped[ticketId] = [];
        grouped[ticketId].push(seatId);
      }
    });
    onConfirm(grouped);
    setSelectedSeats([]);
  };

  const handleClose = () => {
    setSelectedSeats([]);
    onClose();
  };

  // Compute color for each seat
  const getSeatStatus = (seatId: string): 'occupied' | 'selected' | 'assigned' | 'free' => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    if (mapConfig.seatAssignments?.[seatId]) return 'assigned';
    return 'free';
  };

  const getSeatBgColor = (seatId: string): string => {
    const status = getSeatStatus(seatId);
    if (status === 'occupied') return '#9CA3AF';
    if (status === 'selected') return '#9BEA00';
    if (status === 'assigned') {
      const ticketId = mapConfig.seatAssignments[seatId];
      const idx = tickets.findIndex((t) => t._id === ticketId);
      const colors = ['#8E33FF', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
      return `${colors[idx % colors.length]}80`;
    }
    return '#E5E7EB';
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const ticket = getTicketForSeat(seatId);
    return sum + (ticket?.price || 0);
  }, 0);

  // ─── Grid Layout ────────────────────────────────────────────────────────

  const renderGrid = () => {
    const rows = getRows();
    const cols = Math.max(1, Math.min(30, mapConfig.gridCols || 8));
    return (
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ bgcolor: '#D1D5DB', borderRadius: 1, mb: 3, mx: 4, py: 0.8, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', fontSize: 11 }}>
            PALCO / TELA
          </Typography>
        </Box>
        <Stack spacing={0.5}>
          {rows.map((row) => (
            <Stack key={row} direction="row" spacing={0.4} alignItems="center">
              <Typography variant="caption" sx={{ width: 18, fontWeight: 'bold', color: '#6B7280', textAlign: 'center', fontSize: 11 }}>
                {row}
              </Typography>
              {Array.from({ length: cols }, (_, colIdx) => {
                const seatId = `${row}-${colIdx + 1}`;
                const status = getSeatStatus(seatId);
                const ticket = getTicketForSeat(seatId);
                const bgcolor = getSeatBgColor(seatId);

                return (
                  <Tooltip
                    key={seatId}
                    title={
                      status === 'occupied'
                        ? `${row}${colIdx + 1} — Ocupado`
                        : ticket
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
                        cursor: status === 'occupied' ? 'not-allowed' : (status === 'assigned' || status === 'selected') ? 'pointer' : 'default',
                        transition: 'all 0.1s',
                        border: status === 'selected' ? '2px solid #79b800' : '1px solid rgba(0,0,0,0.1)',
                        flexShrink: 0,
                        opacity: status === 'free' ? 0.25 : 1,
                        '&:hover': status !== 'occupied' && ticket ? { transform: 'scaleY(1.1)', opacity: 1 } : {},
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  };

  // ─── Tables Layout ───────────────────────────────────────────────────────

  const renderTables = () => {
    const numT = Math.max(1, Math.min(20, mapConfig.numTables || 4));
    const seatsT = Math.max(2, Math.min(12, mapConfig.seatsPerTable || 6));
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={3} sx={{ p: 1 }}>
          {Array.from({ length: numT }, (_, tIdx) => (
            <Grid item key={tIdx} xs={6} sm={4} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563', fontSize: 11 }}>
                  Mesa {tIdx + 1}
                </Typography>
                <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: '#F3F4F6', border: '2px solid #D1D5DB', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', fontSize: 10 }}>{tIdx + 1}</Typography>
                  </Box>
                  {Array.from({ length: seatsT }, (_, sIdx) => {
                    const angle = (360 / seatsT) * sIdx - 90;
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
                        status === 'occupied'
                          ? `Mesa ${tIdx + 1} - Cad ${sIdx + 1} — Ocupado`
                          : ticket
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
                            cursor: status === 'occupied' ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            opacity: status === 'free' ? 0.25 : 1,
                            '&:hover': status !== 'occupied' ? { transform: 'scale(1.3)', zIndex: 2 } : {},
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // ─── Sectors Layout ──────────────────────────────────────────────────────

  const renderSectors = () => (
    <Stack spacing={2}>
      {mapConfig.sectors?.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', py: 4 }}>
          Nenhum setor configurado.
        </Typography>
      ) : (
        mapConfig.sectors?.map((sector) => {
          const ticket = tickets.find((t) => t._id === sector.ticketId);
          const selectedInSector = selectedSeats.filter((s) => s.startsWith(`setor_${sector.id}_`)).length;
          const occupiedInSector = occupiedSeats.filter((s) => s.startsWith(`setor_${sector.id}_`)).length;
          const availableInSector = sector.capacity - occupiedInSector - selectedInSector;
          const maxSelectMore = Math.max(0, availableInSector);
          const occupancyRate = ((occupiedInSector + selectedInSector) / sector.capacity) * 100;

          const handleAddSectorSeat = () => {
            if (maxSelectMore <= 0) return;
            const newSeatId = `setor_${sector.id}_${Date.now()}`;
            setSelectedSeats((prev) => [...prev, newSeatId]);
            // Register in seatAssignments context for price lookup
            if (sector.ticketId) {
              mapConfig.seatAssignments[newSeatId] = sector.ticketId;
            }
          };

          const handleRemoveSectorSeat = () => {
            const sectorSeats = selectedSeats.filter((s) => s.startsWith(`setor_${sector.id}_`));
            if (sectorSeats.length === 0) return;
            setSelectedSeats((prev) => {
              const toRemove = sectorSeats[sectorSeats.length - 1];
              return prev.filter((s) => s !== toRemove);
            });
          };

          return (
            <Box
              key={sector.id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `2px solid ${sector.color}`,
                bgcolor: `${sector.color}0D`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111' }}>
                    {sector.name}
                  </Typography>
                  {ticket && (
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {ticket.name} — R$ {ticket.price.toFixed(2)} por lugar
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={`${availableInSector} disponíveis`}
                  size="small"
                  sx={{ bgcolor: availableInSector > 0 ? sector.color : '#9CA3AF', color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, occupancyRate)}
                sx={{
                  mb: 1.5,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: `${sector.color}30`,
                  '& .MuiLinearProgress-bar': { bgcolor: sector.color, borderRadius: 4 },
                }}
              />
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mb: 1.5 }}>
                {occupiedInSector} ocupados de {sector.capacity} ({availableInSector} livres)
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  size="small"
                  onClick={handleRemoveSectorSeat}
                  disabled={selectedInSector === 0}
                  sx={{ border: '1px solid rgba(0,0,0,0.1)' }}
                >
                  <Iconify icon="carbon:subtract" width={16} />
                </IconButton>
                <Typography sx={{ fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>{selectedInSector}</Typography>
                <IconButton
                  size="small"
                  onClick={handleAddSectorSeat}
                  disabled={maxSelectMore === 0}
                  sx={{ border: '1px solid rgba(0,0,0,0.1)' }}
                >
                  <Iconify icon="carbon:add" width={16} />
                </IconButton>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  selecionado(s) neste setor
                </Typography>
              </Stack>
            </Box>
          );
        })
      )}
    </Stack>
  );

  // ─── Legend ──────────────────────────────────────────────────────────────

  const renderLegend = () => {
    if (mapConfig.type === 'sectors') return null;
    return (
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
        {[
          { color: '#E5E7EB', label: 'Não disponível', opacity: 0.5 },
          { color: '#8E33FF80', label: 'Disponível' },
          { color: '#9BEA00', label: 'Selecionado' },
          { color: '#9CA3AF', label: 'Ocupado' },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: item.color, borderRadius: 0.5, opacity: item.opacity || 1, border: '1px solid rgba(0,0,0,0.1)' }} />
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 11 }}>{item.label}</Typography>
          </Box>
        ))}
      </Stack>
    );
  };

  // ─── Selected Summary ────────────────────────────────────────────────────

  const renderSelectedSummary = () => {
    if (selectedSeats.length === 0) return null;

    // Group by ticket
    const byTicket: Record<string, string[]> = {};
    selectedSeats.forEach((seatId) => {
      const ticketId = mapConfig.seatAssignments?.[seatId];
      if (!ticketId) return;
      if (!byTicket[ticketId]) byTicket[ticketId] = [];
      byTicket[ticketId].push(seatId);
    });

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(155,234,0,0.08)', borderRadius: 2, border: '1px dashed #9BEA00' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#111111' }}>
          Resumo dos lugares selecionados:
        </Typography>
        <Stack spacing={1}>
          {Object.entries(byTicket).map(([ticketId, seats]) => {
            const ticket = tickets.find((t) => t._id === ticketId);
            return (
              <Box key={ticketId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111' }}>{ticket?.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {seats.map((s) => {
                      // Format sector seat IDs nicely
                      if (s.startsWith('setor_')) return `Lugar avulso`;
                      return s.replace('-', '');
                    }).join(', ')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#7A19E6' }}>
                  R$ {((ticket?.price || 0) * seats.length).toFixed(2)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Total ({selectedSeats.length} {selectedSeats.length === 1 ? 'lugar' : 'lugares'}):
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#7A19E6' }}>
            R$ {totalPrice.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const mapTypeLabel = {
    grid: 'Grade de Cadeiras',
    tables: 'Mesas',
    sectors: 'Setores',
  }[mapConfig.type];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '92vh' } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #F3F4F6', pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111111' }}>
              Selecionar Lugares no Mapa
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {mapTypeLabel} — Clique nos lugares disponíveis para selecioná-los
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Iconify icon="carbon:close" width={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {renderLegend()}

        {mapConfig.type === 'grid' && renderGrid()}
        {mapConfig.type === 'tables' && renderTables()}
        {mapConfig.type === 'sectors' && renderSectors()}

        {renderSelectedSummary()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F3F4F6', gap: 1.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderColor: '#E5E7EB', color: '#6B7280' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedSeats.length === 0}
          sx={{
            bgcolor: '#9BEA00',
            color: '#111111',
            fontWeight: 'bold',
            px: 4,
            '&:hover': { bgcolor: '#8ade00' },
            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
          }}
        >
          Confirmar {selectedSeats.length > 0 ? `${selectedSeats.length} Lugar(es)` : 'Seleção'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
