import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { tablesService } from '../../../services/tables';
import TableCard from '../components/Tables/TableCard';
import TableFilters from '../components/Tables/TableFilters';
import TableModal from '../components/Tables/TableModal';

import { C, FONT, glow } from '../../../styles/designTokens';
import {
  TableProperties, Plus, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle,
  Search, SlidersHorizontal, ClipboardList
} from 'lucide-react';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import { useRef } from 'react';
import { BellRing as Bell } from 'lucide-react';

/* ─── STAT MINI CARD ─────────────────────────────────────────── */
function MiniStat({ label, value, color, Icon }) {
  return (
    <div style={{
      background: C.bgCard,
      border: `1.5px solid ${C.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: "12px",
      padding: "14px 16px",
      display: "flex", alignItems: "center", gap: "12px",
      flex: "1 1 140px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "9px",
        background: `${color}18`, border: `1px solid ${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <div style={{ color, fontWeight: "800", fontSize: "22px", lineHeight: 1 }}>{value}</div>
        <div style={{ color: C.textMuted, fontSize: "11px", marginTop: "2px", fontWeight: "600" }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────── */
function EmptyState({ isAdmin, onCreate }) {
  return (
    <div style={{
      textAlign: "center", padding: "72px 24px",
      background: C.bgCard, borderRadius: "20px",
      border: `1.5px solid ${C.border}`,
    }}>
      <div style={{
        width: "72px", height: "72px", borderRadius: "18px",
        background: `${C.pink}15`, border: `1.5px solid ${C.pink}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: glow(C.pink, "22"),
      }}>
        <TableProperties size={32} color={C.pink} />
      </div>
      <h3 style={{ color: C.textPrimary, margin: "0 0 8px", fontFamily: FONT, fontWeight: "800", fontSize: "18px" }}>
        No hay mesas disponibles
      </h3>
      <p style={{ color: C.textSecondary, fontSize: "14px", margin: "0 0 24px" }}>
        {isAdmin ? "Comienza creando tu primera mesa" : "Vuelve más tarde"}
      </p>
      {isAdmin && (
        <button
          onClick={onCreate}
          style={{
            background: C.pink, color: "#fff", border: "none",
            borderRadius: "10px", padding: "12px 24px",
            fontFamily: FONT, fontWeight: "700", fontSize: "14px",
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px",
            boxShadow: glow(C.pink),
          }}
        >
          <Plus size={16} /> Crear primera mesa
        </button>
      )}
    </div>
  );
}

/* ─── LLAMADOS SECTION ───────────────────────────────────────── */
function PendingCallsSection({ calls, onAttend }) {
  if (!calls || calls.length === 0) return null;

  return (
    <div style={{ 
      marginBottom: "32px", 
      background: `linear-gradient(135deg, ${C.orange}08, ${C.orange}15)`,
      border: `1.5px solid ${C.orange}44`,
      borderRadius: "20px",
      padding: "24px",
      boxShadow: glow(C.orange, "15"),
      animation: "fadeDown 0.4s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ 
          width: "40px", height: "40px", borderRadius: "12px", 
          background: C.orange, display: "flex", alignItems: "center", 
          justifyContent: "center", boxShadow: glow(C.orange, "44") 
        }}>
          <Bell size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: C.orange }}>Llamados Pendientes</h2>
          <p style={{ margin: 0, fontSize: "13px", color: C.textSecondary }}>Mesas que requieren atención inmediata</p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {calls.map(table => (
          <div key={table.id} style={{ 
            background: C.bgCard, border: `1px solid ${C.orange}66`, 
            borderRadius: "14px", padding: "14px 18px", 
            display: "flex", alignItems: "center", gap: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            flex: "1 1 280px", maxWidth: "400px"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "800", fontSize: "16px", color: C.textPrimary }}>{table.sNombre}</div>
              <div style={{ fontSize: "12px", color: C.textMuted }}>Desde: {table.sLlamandoContexto || 'Desconocido'}</div>
            </div>
            <button 
              onClick={() => onAttend(table.id)}
              style={{ 
                background: C.orange, color: "#fff", border: "none", 
                borderRadius: "8px", padding: "8px 16px", 
                fontWeight: "700", fontSize: "13px", cursor: "pointer",
                boxShadow: glow(C.orange, "33"), transition: "transform 0.1s"
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Atender
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── TABLES PAGE ────────────────────────────────────────────── */
const Tables = () => {
  const [tables,       setTables]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [filters,      setFilters]      = useState({});
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedTable,setSelectedTable]= useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const prevTablesRef = useRef([]);

  /* ── Carga de datos ── */
  const loadTables = async () => {
    try {
      const data = await tablesService.getAll(filters);
      const newTables = data.data || [];
      
      // Check for new calls
      const activeCalls = newTables.filter(t => t.bLlamandoMesero).map(t => t.id);
      const prevCalls = prevTablesRef.current;
      const hasNewCall = activeCalls.some(id => !prevCalls.includes(id));
      
      if (hasNewCall) {
        // Añadimos ?t= Date.now() para obligar al navegador a cargar el archivo nuevo y no usar caché
        const audio = new Audio(`/assets/sounds/notification.mp3?t=${Date.now()}`);
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.warn('El navegador bloqueó el sonido de notificación. Haz clic en cualquier parte de la página para activarlo.', e);
        });
      }
      
      prevTablesRef.current = activeCalls;
      setTables(newTables);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTables();
  }, [filters]);

  useEffect(() => {
    // Polling every 5 seconds for new calls
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, [filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTables();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleAttendCall = async (id) => {
    try {
      await tablesService.atenderLlamada(id);
      await loadTables();
    } catch (e) { console.error(e); }
  };


  /* ── CRUD handlers ── */
  const handleCreate = () => { setSelectedTable(null); setModalOpen(true); };
  const handleEdit   = (t)  => { setSelectedTable(t);  setModalOpen(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar esta mesa? Podrás reactivarla más adelante editando su estado.')) return;
    try {
      await tablesService.changeStatus(id, 'inactiva');
      await loadTables();
    } catch (e) {
      console.error('Error al desactivar mesa:', e);
      alert(`Error: ${e.response?.data?.message || e.message}`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await tablesService.changeStatus(id, newStatus);
      await loadTables();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (data) => {
    try {
      if (selectedTable) {
        await tablesService.update(selectedTable.id, data);
      } else {
        await tablesService.create(data);
      }
      setModalOpen(false);
      await loadTables();
    } catch (e) { console.error(e); }
  };

  /* ── Stats dinámicas ── */
  const total      = tables.length;
  const disponible = tables.filter(t => t.sEstado === 'disponible').length;
  const ocupada    = tables.filter(t => t.sEstado === 'ocupada').length;
  const reservada  = tables.filter(t => t.sEstado === 'reservada').length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>

        <Breadcrumb />

        {/* ── PAGE HEADER ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "28px",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <TableProperties size={17} color={C.pink} />
              <span style={{ color: C.textMuted, fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Gestión
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(22px,4vw,28px)", fontWeight: "800", color: C.textPrimary, lineHeight: 1.1 }}>
              Mesas
            </h1>
            <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: "13px" }}>
              {total} mesa{total !== 1 ? "s" : ""} registrada{total !== 1 ? "s" : ""}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "8px 14px",
                color: C.textSecondary, fontFamily: FONT, fontWeight: "600",
                fontSize: "13px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.pink; e.currentTarget.style.color = C.pink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
              Actualizar
            </button>

            {/* Ver Pedidos */}
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: `${C.teal}15`, border: `1px solid ${C.teal}44`,
                borderRadius: "10px", padding: "8px 14px",
                color: C.teal, fontFamily: FONT, fontWeight: "700",
                fontSize: "13px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.teal}25`; e.currentTarget.style.borderColor = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${C.teal}15`; e.currentTarget.style.borderColor = `${C.teal}44`; }}
            >
              <ClipboardList size={15} />
              Ver Pedidos
            </button>

            {/* Nueva mesa — solo admin */}
            {isAdmin && (
              <button
                onClick={handleCreate}
                style={{
                  background: C.pink, color: "#fff", border: "none",
                  borderRadius: "10px", padding: "8px 18px",
                  fontFamily: FONT, fontWeight: "700", fontSize: "13px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  boxShadow: glow(C.pink), transition: "box-shadow 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = glow(C.pink, "88")}
                onMouseLeave={e => e.currentTarget.style.boxShadow = glow(C.pink)}
              >
                <Plus size={15} /> Nueva Mesa
              </button>
            )}
          </div>
        </div>

        {/* ── SECCIÓN DE LLAMADOS (Real-time alerts) ── */}
        <PendingCallsSection 
          calls={tables.filter(t => t.bLlamandoMesero)} 
          onAttend={handleAttendCall} 
        />

        {/* ── MINI STATS ── */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          <MiniStat label="Total"       value={total}      color={C.pink}    Icon={TableProperties} />
          <MiniStat label="Disponibles" value={disponible} color={C.teal}    Icon={CheckCircle}     />
          <MiniStat label="Ocupadas"    value={ocupada}    color={C.orange}  Icon={XCircle}         />
          <MiniStat label="Reservadas"  value={reservada}  color={C.yellow}  Icon={Clock}           />
        </div>

        {/* ── FILTROS ── */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <SlidersHorizontal size={15} color={C.textMuted} style={{ flexShrink: 0 }} />
          <TableFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* ── CONTENIDO ── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{
              display: "inline-block",
              width: "44px", height: "44px",
              border: `3px solid ${C.border}`,
              borderTopColor: C.pink,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ marginTop: "16px", color: C.textMuted, fontSize: "14px" }}>Cargando mesas...</p>
          </div>

        ) : tables.length === 0 ? (
          <EmptyState isAdmin={isAdmin} onCreate={handleCreate} />

        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: "16px",
          }}>
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onAttendCall={handleAttendCall}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modal */}
      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        table={selectedTable}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Tables;