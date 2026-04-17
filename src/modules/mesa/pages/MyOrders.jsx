import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { ordersService } from '../../../services/orders';
import { tablesService } from '../../../services/tables';
import { C, FONT, glow } from '../../../styles/designTokens';
import { usePedirCuenta } from '../../../hooks/usePedirCuenta';
import { PayConfirmModal } from '../components/PayConfirmModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { 
  ClipboardList, UtensilsCrossed, ShoppingBag, 
  Clock, CheckCircle, ChefHat, Truck, XCircle,
  RefreshCw, MapPin, LogOut, Utensils, Plus,
  Filter, Search, ChevronDown, AlertCircle,
  ArrowRight, Calendar, TableProperties, Loader 
} from 'lucide-react';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import { EmojiRatingModal } from '../components/EmojiRatingModal';

/* ─── ESTADO CONFIG ──────────────────────────────────────────── */
const ESTADO = {
  pendiente:      { label: 'Pendiente',      color: '#F59E0B', Icon: Clock        },
  en_preparacion: { label: 'En preparación', color: '#F97316', Icon: ChefHat      },
  listo:          { label: '¡Listo!',        color: '#14B8A6', Icon: CheckCircle  },
  entregado:      { label: 'Entregado',      color: '#8B5CF6', Icon: Truck        },
  cancelado:      { label: 'Cancelado',      color: '#EC4899', Icon: XCircle      },
};

const FLUJO = {
  pendiente:      ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo',          'cancelado'],
  listo:          ['entregado'],
  entregado:      [],
  cancelado:      [],
};

const ESTADO_LABELS = {
  todos:          'Todos',
  pendiente:      'Pendiente',
  en_preparacion: 'En preparación',
  listo:          'Listo',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
};

/* ─── NAV BUTTON (cliente) ───────────────────────────────────── */
function NavBtn({ label, active, color, onClick, children }) {
  const [hov, setHov] = useState(false);
  const c = color || C.teal;
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: active ? `${c}18` : hov ? C.bgCardHov : 'transparent', border: `1.5px solid ${active ? c + '55' : hov ? C.border : 'transparent'}`, borderRadius: '8px', padding: '6px 12px', color: active ? c : hov ? C.textPrimary : C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.18s', flexShrink: 0 }}>
      {children} {label}
    </button>
  );
}

/* ─── CLIENT HEADER ──────────────────────────────────────────── */
function ClientHeader({ totalItems, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mesaNombre, iMesaId } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <header style={{ background: C.bgAccent, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 16px rgba(0,0,0,0.4)', fontFamily: FONT }}>
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.teal}, ${C.teal}88, transparent)` }} />
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px', height: '54px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div onClick={() => navigate('/menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${C.teal}22`, border: `1.5px solid ${C.teal}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={15} color={C.teal} />
            </div>
            <span style={{ color: C.cream, fontWeight: '800', fontSize: '16px' }}>iTaquito</span>
          </div>
          {(mesaNombre || iMesaId) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${C.teal}12`, border: `1px solid ${C.teal}33`, borderRadius: '20px', padding: '4px 10px', color: C.teal, fontSize: '12px', fontWeight: '700' }}>
              <MapPin size={11} /> {mesaNombre || `Mesa ${iMesaId}`}
            </div>
          )}
          <div style={{ flex: 1 }} />
          <NavBtn label="Menú"        active={pathname === '/menu'}      color={C.teal}   onClick={() => navigate('/menu')}><UtensilsCrossed size={14} /></NavBtn>
          <NavBtn label="Mi Pedido"   active={pathname === '/my-order'}  color={C.pink}   onClick={() => navigate('/my-order')}>
            <ShoppingBag size={14} />
            {totalItems > 0 && <span style={{ background: C.pink, color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>}
          </NavBtn>
          <NavBtn label="Mis Pedidos" active={pathname === '/my-orders'} color={C.purple} onClick={() => navigate('/my-orders')}><ClipboardList size={14} /></NavBtn>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}33`, borderRadius: '8px', padding: '6px 12px', color: C.pink, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.pink}22`; e.currentTarget.style.borderColor = C.pink; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${C.pink}12`; e.currentTarget.style.borderColor = `${C.pink}33`; }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
        title="¿Cerrar sesión?"
        message="Se cerrará tu sesión en esta mesa. Tus pedidos activos seguirán en proceso."
      />
    </>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────────── */
function StatusBadge({ estado }) {
  const s = ESTADO[estado] || ESTADO.pendiente;
  const Icon = s.Icon;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${s.color}18`, border: `1px solid ${s.color}44`, color: s.color, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
      <Icon size={12} /> {s.label}
    </div>
  );
}

/* ─── ORDER PROGRESS BAR ─────────────────────────────────────── */
const PROGRESS_STEPS = [
  { key: 'pendiente',      label: 'Pendiente',   emoji: '🕐', color: '#F59E0B' },
  { key: 'en_preparacion', label: 'En cocina',    emoji: '👨‍🍳', color: '#F97316' },
  { key: 'listo',          label: '¡Listo!',      emoji: '✅', color: '#14B8A6' },
  { key: 'entregado',      label: 'Entregado',    emoji: '🌮', color: '#8B5CF6' },
];

function OrderProgressBar({ currentStatus }) {
  const currentIdx = PROGRESS_STEPS.findIndex(s => s.key === currentStatus);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div style={{ padding: '14px 0 6px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIdx;
          const isActive    = idx === activeIdx;
          const isPending   = idx > activeIdx;

          return (
            <div key={step.key} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', position: 'relative', zIndex: 2,
            }}>
              {/* Connector line (left side) */}
              {idx > 0 && (
                <div style={{
                  position: 'absolute', top: '16px',
                  right: '50%', width: '100%', height: '3px',
                  background: isCompleted || isActive
                    ? `linear-gradient(90deg, ${PROGRESS_STEPS[idx - 1].color}, ${step.color})`
                    : C.border,
                  transition: 'background 0.5s ease',
                  zIndex: 0,
                }} />
              )}

              {/* Circle */}
              <div style={{
                width: '34px', height: '34px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', lineHeight: 1,
                background: isCompleted
                  ? `${step.color}22`
                  : isActive
                    ? `${step.color}18`
                    : C.bg,
                border: `2.5px solid ${isCompleted ? step.color : isActive ? step.color : C.border}`,
                boxShadow: isActive
                  ? `0 0 0 4px ${step.color}20, 0 4px 12px ${step.color}30`
                  : 'none',
                transition: 'all 0.4s ease',
                position: 'relative', zIndex: 2,
                animation: isActive ? 'progressPulse 2s ease-in-out infinite' : 'none',
              }}>
                {step.emoji}
              </div>

              {/* Label */}
              <span style={{
                marginTop: '6px',
                fontSize: '10px',
                fontWeight: isActive ? '800' : '600',
                color: isCompleted ? step.color : isActive ? step.color : C.textMuted,
                fontFamily: FONT,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                lineHeight: 1.2,
                maxWidth: '70px',
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active status message */}
      {activeIdx >= 0 && activeIdx < PROGRESS_STEPS.length && currentStatus !== 'cancelado' && currentStatus !== 'entregado' && (
        <div style={{
          marginTop: '10px', textAlign: 'center',
          animation: 'progressFadeIn 0.5s ease',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: `${PROGRESS_STEPS[activeIdx].color}10`,
            border: `1px solid ${PROGRESS_STEPS[activeIdx].color}30`,
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '11px', fontWeight: '700',
            color: PROGRESS_STEPS[activeIdx].color,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: PROGRESS_STEPS[activeIdx].color,
              animation: 'progressBlink 1.4s ease-in-out infinite',
            }} />
            {activeIdx === 0 && 'Tu pedido fue recibido'}
            {activeIdx === 1 && 'Se está preparando tu pedido'}
            {activeIdx === 2 && '¡Tu pedido está listo para recoger!'}
            {activeIdx === 3 && 'Pedido entregado'}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── ORDER CARD (cliente) ───────────────────────────────────── */
function ClientOrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const estado = ESTADO[order.sEstado] || ESTADO.pendiente;
  const isActive = ['pendiente', 'en_preparacion', 'listo'].includes(order.sEstado);

  return (
    <div style={{ background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ height: '3px', background: estado.color }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '15px' }}>Pedido #{order.id}</div>
            <div style={{ color: C.textMuted, fontSize: '12px', marginTop: '2px' }}>
              {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <StatusBadge estado={order.sEstado} />
        </div>

        {/* ─── Progress Bar para pedidos activos ─── */}
        {isActive && (
          <OrderProgressBar currentStatus={order.sEstado} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {(order.items || []).slice(0, open ? undefined : 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: C.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: C.textMuted, fontWeight: '700', fontSize: '11px', background: C.bgAccent, borderRadius: '4px', padding: '1px 5px' }}>x{item.iCantidad}</span>
                {item.producto?.sNombre || `Producto #${item.iProductoId}`}
              </span>
              <span style={{ color: C.textSecondary, fontSize: '12px', fontWeight: '600' }}>${parseFloat(item.dSubtotal).toFixed(2)}</span>
            </div>
          ))}
          {!open && (order.items?.length || 0) > 3 && (
            <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: C.teal, fontSize: '12px', fontWeight: '700', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: FONT }}>
              +{order.items.length - 3} más...
            </button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ color: C.textMuted, fontSize: '13px' }}>Total</span>
          <span style={{ color: C.yellow, fontWeight: '800', fontSize: '17px' }}>${parseFloat(order.dTotal).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN ORDER CARD ───────────────────────────────────────── */
function AdminOrderCard({ order, onChangeStatus, onCancel, updating }) {
  const [open, setOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const estado = ESTADO[order.sEstado] || ESTADO.pendiente;
  const siguientes = FLUJO[order.sEstado] || [];
  const isUpdating = updating === order.id;

  return (
    <>
      <div style={{
        background: C.bgCard,
        border: `1.5px solid ${open ? estado.color + '55' : C.border}`,
        borderRadius: '16px', overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: open ? `0 4px 20px rgba(0,0,0,0.2)` : '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${estado.color}, ${estado.color}66)` }} />

        <div onClick={() => setOpen(p => !p)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: open ? `${estado.color}06` : 'transparent', transition: 'background 0.2s' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${estado.color}15`, border: `1px solid ${estado.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isUpdating ? <Loader size={16} color={estado.color} style={{ animation: 'spin 0.8s linear infinite' }} /> : <estado.Icon size={16} color={estado.color} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>Pedido #{order.id}</span>
              <StatusBadge estado={order.sEstado} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <TableProperties size={10} /> {order.mesa?.sNombre || `Mesa ${order.iMesaId}`}
              </span>
              <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={10} /> {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span style={{ fontSize: '11px', color: C.textMuted }}>
                {(order.items || []).length} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '17px', fontWeight: '800', color: C.orange }}>${parseFloat(order.dTotal || 0).toFixed(2)}</div>
            <ChevronDown size={14} color={C.textMuted} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: '2px' }} />
          </div>
        </div>

        {open && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 18px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: C.bg, borderRadius: '8px' }}>
                  <span style={{ color: C.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ background: `${C.orange}20`, color: C.orange, borderRadius: '5px', padding: '1px 6px', fontSize: '11px', fontWeight: '700' }}>×{item.iCantidad}</span>
                    {item.producto?.sNombre || `Producto #${item.iProductoId}`}
                    {item.sNotas && <span style={{ color: C.textMuted, fontSize: '11px' }}>({item.sNotas})</span>}
                  </span>
                  <span style={{ color: C.textPrimary, fontSize: '13px', fontWeight: '700' }}>${parseFloat(item.dSubtotal || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {order.sNotas && (
              <div style={{ background: `${C.yellow}10`, border: `1px solid ${C.yellow}30`, borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', fontSize: '12px', color: C.textSecondary }}>
                <span style={{ color: C.yellow, fontWeight: '700' }}>Nota: </span>{order.sNotas}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${C.orange}10`, border: `1px solid ${C.orange}25`, borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
              <span style={{ color: C.textSecondary, fontWeight: '700', fontSize: '13px' }}>Total</span>
              <span style={{ color: C.orange, fontWeight: '900', fontSize: '18px' }}>${parseFloat(order.dTotal || 0).toFixed(2)}</span>
            </div>

            {siguientes.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {siguientes.filter(s => s !== 'cancelado').map(sig => {
                  const e = ESTADO[sig];
                  return (
                    <button key={sig} onClick={() => onChangeStatus(order.id, sig)} disabled={isUpdating}
                      style={{ flex: 1, minWidth: '120px', background: e.color, border: 'none', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isUpdating ? 0.6 : 1, transition: 'all 0.18s', boxShadow: `0 4px 14px ${e.color}44` }}
                      onMouseEnter={ev => { if (!isUpdating) ev.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.opacity = isUpdating ? '0.6' : '1'; }}>
                      <e.Icon size={14} /> {e.label}
                    </button>
                  );
                })}
                {siguientes.includes('cancelado') && (
                  <button onClick={() => setShowCancelModal(true)} disabled={isUpdating}
                    style={{ background: 'none', border: `1.5px solid ${C.pink}55`, borderRadius: '10px', padding: '10px 14px', color: C.pink, fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: isUpdating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isUpdating ? 0.6 : 1, transition: 'all 0.18s' }}
                    onMouseEnter={ev => { if (!isUpdating) { ev.currentTarget.style.background = `${C.pink}12`; ev.currentTarget.style.borderColor = C.pink; } }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = 'none'; ev.currentTarget.style.borderColor = `${C.pink}55`; }}>
                    <XCircle size={14} /> Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => { setShowCancelModal(false); onCancel(order.id); }}
        title="¿Cancelar pedido?"
        message={`¿Estás seguro de que deseas cancelar el Pedido #${order.id}? Esta acción no se puede deshacer.`}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VISTA ADMIN
═══════════════════════════════════════════════════════════════ */
function AdminOrdersView() {
  const [orders,     setOrders]     = useState([]);
  const [mesas,      setMesas]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating,   setUpdating]   = useState(null);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState(null);

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMesa,   setFiltroMesa]   = useState('todas');
  const [filtroFecha,  setFiltroFecha]  = useState('');
  const [search,       setSearch]       = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [ordersRes, mesasRes] = await Promise.all([
        ordersService.getAll(),
        tablesService.getAll(),
      ]);
      const allOrders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || []);
      const allMesas  = Array.isArray(mesasRes)  ? mesasRes  : (mesasRes.data  || []);
      setOrders(allOrders);
      setMesas(allMesas);
    } catch (e) {
      setError('Error al cargar los pedidos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const t = setInterval(loadData, 5000);
    return () => clearInterval(t);
  }, [loadData]);

  const handleRefresh = () => { setRefreshing(true); loadData(); };

  const handleChangeStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await ordersService.changeStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, sEstado: newStatus } : o));
      showToast(`Pedido #${orderId} → ${ESTADO[newStatus]?.label}`);
    } catch (e) {
      showToast(`Error al actualizar pedido #${orderId}`, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (orderId) => {
    setUpdating(orderId);
    try {
      await ordersService.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, sEstado: 'cancelado' } : o));
      showToast(`Pedido #${orderId} cancelado`);
    } catch (e) {
      showToast(`Error al cancelar pedido #${orderId}`, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    if (filtroEstado !== 'todos' && o.sEstado !== filtroEstado) return false;
    if (filtroMesa   !== 'todas' && String(o.iMesaId) !== filtroMesa) return false;
    if (filtroFecha) {
      const fechaOrden = new Date(o.createdAt).toISOString().split('T')[0];
      if (fechaOrden !== filtroFecha) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const mesaNombre = o.mesa?.sNombre?.toLowerCase() || '';
      const id = String(o.id);
      if (!id.includes(q) && !mesaNombre.includes(q)) return false;
    }
    return true;
  });

  const resumen = Object.keys(ESTADO).reduce((acc, k) => {
    acc[k] = orders.filter(o => o.sEstado === k).length;
    return acc;
  }, {});

  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = orders
    .filter(o => o.sEstado === 'pagado' && o.dFechaPago && new Date(o.dFechaPago).toISOString().split('T')[0] === hoy)
    .reduce((s, o) => s + parseFloat(o.dTotal || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <Breadcrumb />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ClipboardList size={16} color={C.purple} />
              <span style={{ color: C.textMuted, fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Administración</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(20px,4vw,28px)', fontWeight: '800', color: C.textPrimary }}>Pedidos del día</h1>
            <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: '13px' }}>
              {filtered.length} pedido{filtered.length !== 1 ? 's' : ''} · Ventas hoy: <span style={{ color: C.teal, fontWeight: '700' }}>${ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '8px 16px', color: C.textSecondary, fontFamily: FONT, fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', opacity: refreshing ? 0.6 : 1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.color = C.purple; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          {Object.entries(ESTADO).map(([key, { label, color, Icon }]) => (
            <button key={key} onClick={() => setFiltroEstado(filtroEstado === key ? 'todos' : key)}
              style={{ background: filtroEstado === key ? `${color}18` : C.bgCard, border: `1.5px solid ${filtroEstado === key ? color : C.border}`, borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', boxShadow: filtroEstado === key ? `0 4px 14px ${color}22` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Icon size={13} color={color} />
                <span style={{ fontSize: '11px', color: filtroEstado === key ? color : C.textMuted, fontWeight: '700' }}>{label}</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: filtroEstado === key ? color : C.textPrimary }}>{resumen[key] || 0}</div>
            </button>
          ))}
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 18px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
            <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por # o mesa..."
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 10px 7px 30px', color: C.textPrimary, fontFamily: FONT, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <select value={filtroMesa} onChange={e => setFiltroMesa(e.target.value)}
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 10px', color: C.textSecondary, fontFamily: FONT, fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
            <option value="todas">Todas las mesas</option>
            {mesas.map(m => <option key={m.id} value={String(m.id)}>{m.sNombre || `Mesa ${m.id}`}</option>)}
          </select>
          <input type="date" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 10px', color: filtroFecha ? C.textPrimary : C.textMuted, fontFamily: FONT, fontSize: '13px', outline: 'none', cursor: 'pointer' }} />
          {(filtroEstado !== 'todos' || filtroMesa !== 'todas' || filtroFecha || search) && (
            <button onClick={() => { setFiltroEstado('todos'); setFiltroMesa('todas'); setFiltroFecha(''); setSearch(''); }}
              style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}33`, borderRadius: '8px', padding: '7px 12px', color: C.pink, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              × Limpiar
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}40`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: C.pink, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: `3px solid ${C.border}`, borderTopColor: C.purple, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '12px', color: C.textMuted, fontSize: '13px' }}>Cargando pedidos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: C.bgCard, borderRadius: '18px', border: `1.5px solid ${C.border}` }}>
            <ClipboardList size={28} color={C.textMuted} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <h3 style={{ color: C.textPrimary, margin: '0 0 6px', fontWeight: '800' }}>Sin pedidos</h3>
            <p style={{ color: C.textMuted, margin: 0, fontSize: '13px' }}>No hay pedidos con los filtros seleccionados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(order => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onChangeStatus={handleChangeStatus}
                onCancel={handleCancel}
                updating={updating}
              />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 600, background: C.bgCard, border: `1.5px solid ${toast.type === 'success' ? C.teal : C.pink}55`, borderRadius: '14px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: FONT, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease', maxWidth: '340px' }}>
          {toast.type === 'success' ? <CheckCircle size={18} color={C.teal} /> : <XCircle size={18} color={C.pink} />}
          <span style={{ color: C.textPrimary, fontSize: '13px', fontWeight: '600' }}>{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VISTA CLIENTE
═══════════════════════════════════════════════════════════════ */
function ClientOrdersView() {
  const navigate = useNavigate();
  const { loginAt, logout, getMesaId, mesaNombre } = useAuth();
  const { totalItems } = useCart();
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [animatingEnd, setAnimatingEnd] = useState(false);
  const [error,        setError]        = useState('');
  const [showPayModal,    setShowPayModal]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Emoji Rating ──
  const [showEmojiRating, setShowEmojiRating]  = useState(false);
  const [pendingAction,   setPendingAction]    = useState(null); // 'logout' | 'pay'

  const iMesaId = getMesaId();

  const loadOrders = useCallback(async () => {
    if (!iMesaId) {
      setError('No se ha identificado la mesa. Por favor, cierra sesión y vuelve a iniciar.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const currentToken = localStorage.getItem('mesaSessionToken');
      const data = await ordersService.getAll({ iMesaId, sTokenSesion: currentToken });
      setOrders(data.data || []);
      setError('');
    } catch (e) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [iMesaId]);

  const { ejecutar: ejecutarPago, loading: payLoading, error: payError, clearError: clearPayError } = usePedirCuenta({
    iMesaId,
    onEnPago:     useCallback(() => { setAnimatingEnd(true); setTimeout(() => navigate('/menu'), 2000); }, [navigate]),
    onDisponible: useCallback(() => { setAnimatingEnd(true); setTimeout(() => navigate('/menu'), 2000); }, [navigate]),
  });

  const handleAbrirPayModal  = () => { clearPayError(); setShowPayModal(true); };
  const handleCerrarPayModal = () => { if (!payLoading) setShowPayModal(false); };
  const handleConfirmarPago  = async () => { 
    const ok = await ejecutarPago(); 
    if (ok) {
      setShowPayModal(false);
      setPendingAction('pay');
      setShowEmojiRating(true);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setPendingAction('logout');
    setShowEmojiRating(true);
  };

  const handleEmojiComplete = async () => {
    setShowEmojiRating(false);
    if (pendingAction === 'logout') {
      logout();
    }
    setPendingAction(null);
  };

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => {
    if (!iMesaId) return;
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [iMesaId, loadOrders]);

  const handleRefresh = () => { setRefreshing(true); loadOrders(); };
  const activos     = orders.filter(o => ['pendiente', 'en_preparacion'].includes(o.sEstado));
  const completados = orders.filter(o => ['listo', 'entregado', 'cancelado'].includes(o.sEstado));

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      {animatingEnd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: C.orange, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOut 2s forwards' }}>
          <div style={{ animation: 'bounceUp 0.6s ease-in-out infinite alternate' }}>
            <ClipboardList size={100} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '900', marginTop: '24px', textAlign: 'center', padding: '0 20px' }}>Enviando tu cuenta al cajero...</h1>
        </div>
      )}

      <ClientHeader totalItems={totalItems} onLogout={logout} />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 60px' }}>
        <Breadcrumb />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ClipboardList size={16} color={C.purple} />
              <span style={{ color: C.textMuted, fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Esta sesión</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(20px,4vw,26px)', fontWeight: '800', color: C.textPrimary }}>Mis Pedidos</h1>
            {loginAt && (
              <p style={{ margin: '4px 0 0', color: C.textMuted, fontSize: '12px' }}>
                Desde las {new Date(loginAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleRefresh}
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 14px', color: C.textSecondary, fontFamily: FONT, fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} /> Actualizar
            </button>
            <button onClick={() => navigate('/menu')}
              style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: '9px', padding: '8px 16px', fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: glow(C.pink, '44') }}>
              <Plus size={14} /> Nuevo pedido
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: `3px solid ${C.border}`, borderTopColor: C.purple, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '14px', color: C.textMuted, fontSize: '14px' }}>Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}44`, borderRadius: '12px', padding: '16px 20px', color: C.pink, fontSize: '13px', fontWeight: '600' }}>{error}</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${C.purple}12`, border: `1.5px solid ${C.purple}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ClipboardList size={28} color={C.purple} />
            </div>
            <h3 style={{ color: C.textPrimary, margin: '0 0 8px', fontWeight: '800' }}>Sin pedidos aún</h3>
            <p style={{ color: C.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>No has realizado ningún pedido en esta sesión</p>
            <button onClick={() => navigate('/menu')} style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={16} /> Ver el menú
            </button>
          </div>
        ) : (
          <>
            {activos.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: C.orange, boxShadow: glow(C.orange) }} />
                  <h2 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C.textPrimary, textTransform: 'uppercase', letterSpacing: '1px' }}>En proceso</h2>
                  <span style={{ background: `${C.orange}18`, border: `1px solid ${C.orange}44`, color: C.orange, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700' }}>{activos.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activos.map(o => <ClientOrderCard key={o.id} order={o} />)}
                </div>
              </div>
            )}
            {completados.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: C.textMuted }} />
                  <h2 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '1px' }}>Historial</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {completados.map(o => <ClientOrderCard key={o.id} order={o} />)}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <button onClick={handleAbrirPayModal}
        style={{ position: 'fixed', bottom: '24px', left: '24px', background: C.orange, color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 20px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 8px 24px rgba(0,0,0,0.4), ${glow(C.orange, '66')}`, zIndex: 150, transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <ClipboardList size={18} /> Pedir Cuenta
      </button>

      <PayConfirmModal isOpen={showPayModal} onConfirm={handleConfirmarPago} onCancel={handleCerrarPayModal} loading={payLoading} error={payError} />
      
      <EmojiRatingModal 
        isOpen={showEmojiRating} 
        iMesaId={iMesaId}
        onComplete={handleEmojiComplete} 
      />

      <style>{`
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes fadeInOut  { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes bounceUp   { from { transform: translateY(0); } to { transform: translateY(-30px); } }
        @keyframes scaleUp    { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes progressPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.1); transform: scale(1); }
          50%      { box-shadow: 0 0 0 8px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.15); transform: scale(1.1); }
        }
        @keyframes progressBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes progressFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENTRY POINT
═══════════════════════════════════════════════════════════════ */
const Orders = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.rol === 'admin' || user.rol === 'cajero' || user.rol === 'mesero') {
    return <AdminOrdersView />;
  }
  return <ClientOrdersView />;
};

export default Orders;