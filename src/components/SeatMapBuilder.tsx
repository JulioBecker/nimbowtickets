import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Card,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Icon } from '@iconify/react';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SectorConfig {
  id: string;
  name: string;
  capacity: number;
  ticketId: string;
  color: string;
}

export interface LayoutBlock {
  id: string;
  name: string;
  type: 'stage' | 'bathrooms' | 'food' | 'sector' | 'custom';
  gridRow: number;
  gridCol: number;
  gridRowSpan: number;
  gridColSpan: number;
  color: string;
  sectorId?: string; // links to SectorConfig.id
  border?: string;   // optional border color
}

export interface MapConfig {
  enabled: boolean;
  type: 'grid' | 'tables' | 'sectors';
  // Grid (theater/cinema)
  gridRows: string;   // e.g. 'F' = rows A..F
  gridCols: number;
  // Tables (dinner/show)
  numTables: number;
  seatsPerTable: number;
  // Sectors (stadium/festival)
  sectors: SectorConfig[];
  sectorsLayout?: LayoutBlock[];
  // Seat → ticket assignment map
  seatAssignments: Record<string, string>;
}

export const DEFAULT_SECTORS_LAYOUT: LayoutBlock[] = [
  { id: 'stage', name: 'Palco', type: 'stage', gridRow: 1, gridCol: 2, gridRowSpan: 1, gridColSpan: 4, color: '#000000', border: '#9BEA00' },
  { id: 'front', name: 'Área VIP', type: 'sector', gridRow: 2, gridCol: 1, gridRowSpan: 1, gridColSpan: 6, color: '#FF2E5B' },
  { id: 'pista', name: 'Pista', type: 'sector', gridRow: 3, gridCol: 2, gridRowSpan: 3, gridColSpan: 4, color: '#FF7B00' },
  { id: 'bathrooms', name: 'Banheiros', type: 'bathrooms', gridRow: 3, gridCol: 1, gridRowSpan: 3, gridColSpan: 1, color: '#FFE600' },
  { id: 'food1', name: 'Alimentação', type: 'food', gridRow: 3, gridCol: 6, gridRowSpan: 2, gridColSpan: 1, color: '#007BFF' },
  { id: 'food2', name: 'Alimentação', type: 'food', gridRow: 6, gridCol: 2, gridRowSpan: 1, gridColSpan: 4, color: '#007BFF' },
];

export const DEFAULT_MAP_CONFIG: MapConfig = {
  enabled: false,
  type: 'grid',
  gridRows: 'E',
  gridCols: 8,
  numTables: 4,
  seatsPerTable: 6,
  sectors: [],
  sectorsLayout: DEFAULT_SECTORS_LAYOUT,
  seatAssignments: {},
};

const SECTOR_COLORS = [
  '#8E33FF', '#9BEA00', '#0ea5e9', '#f59e0b', '#ef4444',
  '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316',
];

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface Props {
  mapConfig: MapConfig;
  onChange: (config: MapConfig) => void;
  tickets: { id: string; name: string; price: number }[];
  darkInputStyle?: object;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SeatMapBuilder({ mapConfig, onChange, tickets, darkInputStyle = {} }: Props) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<string>(tickets[0]?.id || '');
  const [brushMode, setBrushMode] = useState(false);

  const update = useCallback((partial: Partial<MapConfig>) => {
    onChange({ ...mapConfig, ...partial });
  }, [mapConfig, onChange]);

  const handleToggleEnabled = (val: boolean) => {
    update({ enabled: val });
  };

  const assignSeat = (seatId: string) => {
    if (!selectedTicketForAssign) return;
    const next = { ...mapConfig.seatAssignments };
    if (next[seatId] === selectedTicketForAssign) {
      delete next[seatId];
    } else {
      next[seatId] = selectedTicketForAssign;
    }
    update({ seatAssignments: next });
  };

  const clearAllAssignments = () => update({ seatAssignments: {} });

  // ─── Sector helpers ──────────────────────────────────────────────────────

  const addSector = () => {
    const id = `sector_${Date.now()}`;
    const newSector: SectorConfig = {
      id,
      name: `Setor ${mapConfig.sectors.length + 1}`,
      capacity: 100,
      ticketId: tickets[0]?.id || '',
      color: SECTOR_COLORS[mapConfig.sectors.length % SECTOR_COLORS.length],
    };
    update({ sectors: [...mapConfig.sectors, newSector] });
  };

  const updateSector = (id: string, partial: Partial<SectorConfig>) => {
    update({
      sectors: mapConfig.sectors.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  };

  const removeSector = (id: string) => {
    update({ sectors: mapConfig.sectors.filter((s) => s.id !== id) });
  };

  // ─── Layout Block helpers ──────────────────────────────────────────────────

  const addLayoutBlock = () => {
    const id = `block_${Date.now()}`;
    const newBlock: LayoutBlock = {
      id,
      name: 'Novo Bloco',
      type: 'custom',
      gridRow: 3,
      gridCol: 3,
      gridRowSpan: 1,
      gridColSpan: 1,
      color: '#6B7280',
    };
    const currentLayout = mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT;
    update({ sectorsLayout: [...currentLayout, newBlock] });
  };

  const updateLayoutBlock = (id: string, partial: Partial<LayoutBlock>) => {
    const currentLayout = mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT;
    update({
      sectorsLayout: currentLayout.map((b) => (b.id === id ? { ...b, ...partial } : b)),
    });
  };

  const removeLayoutBlock = (id: string) => {
    const currentLayout = mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT;
    update({ sectorsLayout: currentLayout.filter((b) => b.id !== id) });
  };

  // ─── Grid Rows ──────────────────────────────────────────────────────────
  const getRows = (): string[] => {
    const maxIdx = ROW_LETTERS.indexOf(mapConfig.gridRows.toUpperCase());
    if (maxIdx < 0) return ['A'];
    return ROW_LETTERS.slice(0, maxIdx + 1).split('');
  };

  // ─── Render Seat Color ───────────────────────────────────────────────────
  const getSeatColor = (seatId: string): string => {
    const assigned = mapConfig.seatAssignments[seatId];
    if (!assigned) return '#E5E7EB';
    const t = tickets.find((tk) => tk.id === assigned);
    if (!t) return '#E5E7EB';
    const colors = ['#8E33FF', '#9BEA00', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];
    const idx = tickets.findIndex((tk) => tk.id === assigned);
    return colors[idx % colors.length];
  };

  const getTicketName = (ticketId: string): string => {
    return tickets.find((t) => t.id === ticketId)?.name || '—';
  };

  const assignedCount = Object.keys(mapConfig.seatAssignments).length;

  // ─── Sub-renders ─────────────────────────────────────────────────────────

  const renderLegend = () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 14, height: 14, bgcolor: '#E5E7EB', borderRadius: 0.5, border: '1px solid #D1D5DB' }} />
        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 11 }}>Livre</Typography>
      </Box>
      {tickets.map((t, idx) => {
        const colors = ['#8E33FF', '#9BEA00', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];
        return (
          <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: colors[idx % colors.length], borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 11 }}>{t.name}</Typography>
          </Box>
        );
      })}
    </Stack>
  );

  const renderGridPreview = () => {
    const rows = getRows();
    const cols = Math.max(1, Math.min(30, mapConfig.gridCols));
    return (
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        {/* Stage */}
        <Box sx={{ bgcolor: '#D1D5DB', borderRadius: 1, mb: 3, mx: 4, py: 0.8, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', fontSize: 11 }}>
            PALCO / PALCO PRINCIPAL
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
                const color = getSeatColor(seatId);
                const isHovered = hoveredSeat === seatId;
                return (
                  <Tooltip key={seatId} title={`${row}${colIdx + 1}${mapConfig.seatAssignments[seatId] ? ' — ' + getTicketName(mapConfig.seatAssignments[seatId]) : ''}`} placement="top">
                    <Box
                      onClick={() => assignSeat(seatId)}
                      onMouseEnter={() => {
                        setHoveredSeat(seatId);
                        if (brushMode) assignSeat(seatId);
                      }}
                      onMouseLeave={() => setHoveredSeat(null)}
                      sx={{
                        width: { xs: 20, sm: 24 },
                        height: { xs: 16, sm: 20 },
                        bgcolor: isHovered ? (color === '#E5E7EB' ? '#d1d5db' : color) : color,
                        borderRadius: '3px 3px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        border: '1px solid rgba(0,0,0,0.1)',
                        transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                        flexShrink: 0,
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

  const renderTablesPreview = () => {
    const numT = Math.max(1, Math.min(20, mapConfig.numTables));
    const seatsT = Math.max(2, Math.min(12, mapConfig.seatsPerTable));
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={3} sx={{ p: 1 }}>
          {Array.from({ length: numT }, (_, tIdx) => {
            const tableLabel = `Mesa ${tIdx + 1}`;
            return (
              <Grid item key={tIdx} xs={6} sm={4} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563', fontSize: 11 }}>
                    {tableLabel}
                  </Typography>
                  <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Table */}
                    <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: '#F3F4F6', border: '2px solid #D1D5DB', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B7280', fontSize: 10 }}>
                        {tIdx + 1}
                      </Typography>
                    </Box>
                    {/* Seats around the table */}
                    {Array.from({ length: seatsT }, (_, sIdx) => {
                      const angle = (360 / seatsT) * sIdx - 90;
                      const rad = (angle * Math.PI) / 180;
                      const radius = 44;
                      const x = 50 + radius * Math.cos(rad) - 8;
                      const y = 50 + radius * Math.sin(rad) - 8;
                      const seatId = `Mesa ${tIdx + 1}-Cad ${sIdx + 1}`;
                      const color = getSeatColor(seatId);
                      return (
                        <Tooltip key={sIdx} title={`${seatId}${mapConfig.seatAssignments[seatId] ? ' — ' + getTicketName(mapConfig.seatAssignments[seatId]) : ''}`}>
                          <Box
                            onClick={() => assignSeat(seatId)}
                            sx={{
                              position: 'absolute',
                              left: `${x}%`,
                              top: `${y}%`,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: color,
                              border: '1px solid rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              transition: 'all 0.1s',
                              '&:hover': { transform: 'scale(1.25)' },
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
    );
  };

  const renderSectorsPreview = () => {
    const layout = mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT;
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {layout.map((block) => {
            const isVertical = block.gridRowSpan > block.gridColSpan;
            return (
              <Box 
                key={block.id}
                sx={{
                  gridRow: `${block.gridRow} / span ${block.gridRowSpan}`,
                  gridColumn: `${block.gridCol} / span ${block.gridColSpan}`,
                  bgcolor: block.color || '#6B7280',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: block.border ? `2px solid ${block.border}` : '1px solid rgba(255,255,255,0.1)',
                  p: 0.5,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <Typography sx={{ 
                  color: block.type === 'stage' ? '#ffffff' : (block.color === '#FFE600' ? '#000000' : '#ffffff'),
                  fontWeight: 900,
                  fontSize: { xs: 8, sm: block.gridColSpan > 2 ? 13 : 9 },
                  letterSpacing: block.gridColSpan > 2 ? 2 : 1,
                  writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb',
                  transform: isVertical ? 'rotate(180deg)' : 'none',
                  lineHeight: 1.1,
                }}>
                  {block.name.toUpperCase()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Toggle Switch */}
      <FormControlLabel
        control={
          <Switch
            checked={mapConfig.enabled}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#8E33FF' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8E33FF' },
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>
              Ativar Mapa Interativo de Assentos / Setores
            </Typography>
            <Typography variant="caption" sx={{ color: '#4B5563', fontSize: 11 }}>
              Permita que os compradores escolham cadeiras, mesas ou setores específicos no mapa.
            </Typography>
          </Box>
        }
      />

      {mapConfig.enabled && (
        <Box sx={{ mt: 3 }}>
          {/* Type selector */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', mb: 1.5, fontSize: 13 }}>
            Tipo de layout do mapa:
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
            {[
              { value: 'grid', icon: 'carbon:grid', label: 'Grade de Cadeiras', desc: 'Teatro, Cinema, Auditório' },
              { value: 'tables', icon: 'carbon:table-split', label: 'Mesas Redondas', desc: 'Jantar, Show com Mesa' },
              { value: 'sectors', icon: 'carbon:area', label: 'Setores Livres', desc: 'Pista, VIP, Arquibancada' },
            ].map((opt) => (
              <Card
                key={opt.value}
                onClick={() => update({ type: opt.value as MapConfig['type'] })}
                sx={{
                  p: 2,
                  minWidth: 150,
                  cursor: 'pointer',
                  border: `2px solid ${mapConfig.type === opt.value ? '#8E33FF' : '#E5E7EB'}`,
                  bgcolor: mapConfig.type === opt.value ? 'rgba(142,51,255,0.05)' : '#ffffff',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#8E33FF' },
                }}
              >
                <Icon icon={opt.icon} width={28} style={{ color: mapConfig.type === opt.value ? '#8E33FF' : '#6B7280' }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, fontSize: 12, color: '#111111' }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280', fontSize: 10 }}>
                  {opt.desc}
                </Typography>
              </Card>
            ))}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Config controls per type */}
          {mapConfig.type === 'grid' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', mb: 1.5, fontSize: 13 }}>
                Configurar Grade de Cadeiras:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Filas (A até…)"
                    value={mapConfig.gridRows}
                    onChange={(e) => update({ gridRows: e.target.value })}
                    size="small"
                    sx={darkInputStyle}
                  >
                    {ROW_LETTERS.slice(0, 20).split('').map((l) => (
                      <MenuItem key={l} value={l}>Até a Fila {l} ({ROW_LETTERS.indexOf(l) + 1} filas)</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cadeiras por Fila"
                    value={mapConfig.gridCols}
                    onChange={(e) => update({ gridCols: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)) })}
                    size="small"
                    inputProps={{ min: 1, max: 30 }}
                    sx={darkInputStyle}
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                Total: <strong>{getRows().length} filas × {mapConfig.gridCols} cadeiras = {getRows().length * mapConfig.gridCols} lugares</strong>
              </Typography>
            </Box>
          )}

          {mapConfig.type === 'tables' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', mb: 1.5, fontSize: 13 }}>
                Configurar Mesas:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Mesas"
                    value={mapConfig.numTables}
                    onChange={(e) => update({ numTables: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                    size="small"
                    inputProps={{ min: 1, max: 20 }}
                    sx={darkInputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lugares por Mesa"
                    value={mapConfig.seatsPerTable}
                    onChange={(e) => update({ seatsPerTable: Math.max(2, Math.min(12, parseInt(e.target.value) || 2)) })}
                    size="small"
                    inputProps={{ min: 2, max: 12 }}
                    sx={darkInputStyle}
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                Total: <strong>{mapConfig.numTables} mesas × {mapConfig.seatsPerTable} lugares = {mapConfig.numTables * mapConfig.seatsPerTable} lugares</strong>
              </Typography>
            </Box>
          )}

          {mapConfig.type === 'sectors' && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>
                  Setores do Evento:
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon="carbon:add" />}
                  onClick={addSector}
                  sx={{ borderColor: '#8E33FF', color: '#8E33FF', fontSize: 12 }}
                >
                  Adicionar Setor
                </Button>
              </Box>
              <Stack spacing={2}>
                {mapConfig.sectors.map((sector) => (
                  <Card key={sector.id} sx={{ p: 2, border: `1px solid ${sector.color}40`, borderLeft: `4px solid ${sector.color}`, bgcolor: '#ffffff' }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Nome do Setor"
                          value={sector.name}
                          onChange={(e) => updateSector(sector.id, { name: e.target.value })}
                          size="small"
                          placeholder="Ex: Pista, VIP, Arquibancada A"
                          sx={darkInputStyle}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Capacidade"
                          value={sector.capacity}
                          onChange={(e) => updateSector(sector.id, { capacity: parseInt(e.target.value) || 0 })}
                          size="small"
                          inputProps={{ min: 1 }}
                          sx={darkInputStyle}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          fullWidth
                          select
                          label="Ingresso vinculado"
                          value={sector.ticketId}
                          onChange={(e) => updateSector(sector.id, { ticketId: e.target.value })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          {tickets.length === 0 ? (
                            <MenuItem value="">Nenhum ingresso</MenuItem>
                          ) : (
                            tickets.map((t) => (
                              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                            ))
                          )}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {SECTOR_COLORS.slice(0, 5).map((c) => (
                            <Box
                              key={c}
                              onClick={() => updateSector(sector.id, { color: c })}
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: c,
                                cursor: 'pointer',
                                border: sector.color === c ? '2px solid #111111' : '1px solid transparent',
                                transition: 'all 0.1s',
                              }}
                            />
                          ))}
                          <IconButton size="small" color="error" onClick={() => removeSector(sector.id)}>
                            <Icon icon="carbon:trash-can" width={16} />
                          </IconButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>

              {/* Visual Layout Builder Section */}
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>
                  Personalização do Layout Visual do Mapa (Blocos do Mapa):
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon="carbon:add" />}
                  onClick={addLayoutBlock}
                  sx={{ borderColor: '#8E33FF', color: '#8E33FF', fontSize: 12 }}
                >
                  Adicionar Bloco de Layout
                </Button>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {(mapConfig.sectorsLayout || DEFAULT_SECTORS_LAYOUT).map((block) => (
                  <Card key={block.id} sx={{ p: 2, border: `1px solid rgba(0,0,0,0.08)`, bgcolor: '#F9FAFB' }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Nome do Bloco"
                          value={block.name}
                          onChange={(e) => updateLayoutBlock(block.id, { name: e.target.value })}
                          size="small"
                          sx={darkInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2.5}>
                        <TextField
                          fullWidth
                          select
                          label="Tipo de Bloco"
                          value={block.type}
                          onChange={(e) => updateLayoutBlock(block.id, { type: e.target.value as any })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          <MenuItem value="stage">Palco</MenuItem>
                          <MenuItem value="bathrooms">Banheiros</MenuItem>
                          <MenuItem value="food">Alimentação</MenuItem>
                          <MenuItem value="sector">Setor de Ingressos</MenuItem>
                          <MenuItem value="custom">Customizado</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          select
                          label="Linha (Row)"
                          value={block.gridRow}
                          onChange={(e) => updateLayoutBlock(block.id, { gridRow: parseInt(e.target.value) || 1 })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          select
                          label="Coluna (Col)"
                          value={block.gridCol}
                          onChange={(e) => updateLayoutBlock(block.id, { gridCol: parseInt(e.target.value) || 1 })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          select
                          label="Alt (RowSpan)"
                          value={block.gridRowSpan}
                          onChange={(e) => updateLayoutBlock(block.id, { gridRowSpan: parseInt(e.target.value) || 1 })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6} sm={1.5}>
                        <TextField
                          fullWidth
                          select
                          label="Larg (ColSpan)"
                          value={block.gridColSpan}
                          onChange={(e) => updateLayoutBlock(block.id, { gridColSpan: parseInt(e.target.value) || 1 })}
                          size="small"
                          sx={darkInputStyle}
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      {block.type === 'sector' && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            select
                            label="Vincular ao Setor de Ingressos"
                            value={block.sectorId || ''}
                            onChange={(e) => {
                              const sec = mapConfig.sectors.find((s) => s.id === e.target.value);
                              updateLayoutBlock(block.id, { 
                                sectorId: e.target.value, 
                                name: sec ? sec.name : block.name,
                                color: sec ? sec.color : block.color
                              });
                            }}
                            size="small"
                            sx={darkInputStyle}
                          >
                            <MenuItem value="">Nenhum setor selecionado</MenuItem>
                            {mapConfig.sectors.map((s) => (
                              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      )}

                      <Grid item xs={12} sm={block.type === 'sector' ? 6 : 12}>
                        <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                          {SECTOR_COLORS.slice(0, 8).map((c) => (
                            <Box
                              key={c}
                              onClick={() => updateLayoutBlock(block.id, { color: c })}
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                bgcolor: c,
                                cursor: 'pointer',
                                border: block.color === c ? '2px solid #111111' : '1px solid transparent',
                                transition: 'all 0.1s',
                              }}
                            />
                          ))}
                          <IconButton size="small" color="error" onClick={() => removeLayoutBlock(block.id)}>
                            <Icon icon="carbon:trash-can" width={18} />
                          </IconButton>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* Ticket assignment toolbar (only for grid and tables) */}
          {mapConfig.type !== 'sectors' && tickets.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#111111', display: 'block', mb: 0.5 }}>
                    Selecione o ingresso e clique nas cadeiras para associar:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {tickets.map((t, idx) => {
                      const colors = ['#8E33FF', '#9BEA00', '#0ea5e9', '#f59e0b', '#ef4444', '#10b981'];
                      const isSelected = selectedTicketForAssign === t.id;
                      return (
                        <Chip
                          key={t.id}
                          label={t.name}
                          clickable
                          onClick={() => setSelectedTicketForAssign(t.id)}
                          sx={{
                            bgcolor: isSelected ? colors[idx % colors.length] : '#E5E7EB',
                            color: isSelected ? '#fff' : '#4B5563',
                            fontWeight: 'bold',
                            fontSize: 12,
                            border: isSelected ? `2px solid ${colors[idx % colors.length]}` : '2px solid transparent',
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={brushMode}
                        onChange={(e) => setBrushMode(e.target.checked)}
                        size="small"
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8E33FF' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8E33FF' } }}
                      />
                    }
                    label={<Typography variant="caption" sx={{ color: '#6B7280', fontSize: 11 }}>Pincel (hover)</Typography>}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={clearAllAssignments}
                    sx={{ borderColor: '#E5E7EB', color: '#6B7280', fontSize: 11 }}
                  >
                    Limpar
                  </Button>
                  {assignedCount > 0 && (
                    <Chip label={`${assignedCount} associado(s)`} size="small" sx={{ bgcolor: 'rgba(142,51,255,0.1)', color: '#8E33FF', fontWeight: 'bold', fontSize: 11 }} />
                  )}
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Preview */}
          <Box sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 2.5, bgcolor: '#ffffff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#111111', fontSize: 13 }}>
                Pré-visualização do Mapa:
              </Typography>
              <Chip
                label="Editor ao vivo"
                size="small"
                sx={{ bgcolor: 'rgba(155,234,0,0.15)', color: '#5a8a00', fontWeight: 'bold', fontSize: 11 }}
                icon={<Icon icon="carbon:view" width={14} />}
              />
            </Box>

            {mapConfig.type !== 'sectors' && renderLegend()}

            {mapConfig.type === 'grid' && renderGridPreview()}
            {mapConfig.type === 'tables' && renderTablesPreview()}
            {mapConfig.type === 'sectors' && renderSectorsPreview()}
          </Box>
        </Box>
      )}
    </Box>
  );
}
