import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { C, FONT, glow } from '../../../styles/designTokens';
import { cajeroService } from '../../../services/cajeroService';
import {
  DollarSign, CheckCircle, XCircle, CreditCard, Wallet,
  RefreshCw, UtensilsCrossed, ChevronDown, ChevronUp,
  Printer, Clock, AlertCircle, ArrowRightLeft, Users,
  History, Receipt, CalendarDays, LogOut, Music, TrendingUp,
  Sparkles, ClipboardList, Bell, Search, Plus,
} from 'lucide-react';
import Breadcrumb from '../../../components/layout/Breadcrumb';

/* ─── HELPERS ────────────────────────────────────────────────── */
const ESTADO_MAP = {
  pendiente:      { label: 'Pendiente',      color: C.yellow  },
  en_preparacion: { label: 'En Preparación', color: C.orange  },
  listo:          { label: '¡Listo!',        color: C.teal    },
  entregado:      { label: 'Entregado',      color: C.purple  },
  pagado:         { label: 'Pagado',         color: C.teal    },
  cancelado:      { label: 'Cancelado',      color: C.pink    },
};

const METODO_CONFIG = {
  efectivo:      { label: 'Efectivo',      Icon: Wallet,         color: C.teal   },
  tarjeta:       { label: 'Tarjeta',       Icon: CreditCard,     color: C.purple },
  transferencia: { label: 'Transferencia', Icon: ArrowRightLeft, color: C.pink   },
};

const fmt = (n) =>
  Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtHora = (d) =>
  new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

const fmtFecha = (d) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

/* ─── NAV BUTTON ─────────────────────────────────────────────── */
function NavBtn({ label, active, onClick, color, disabled, children }) {
  const [hov, setHov] = useState(false);
  const c = color || C.teal;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active ? `${c}18` : hov ? C.bgCardHov : 'transparent',
        border: `1.5px solid ${active ? c + '55' : hov ? C.border : 'transparent'}`,
        borderRadius: '8px', padding: '6px 12px',
        color: active ? c : hov ? C.textPrimary : C.textSecondary,
        fontFamily: FONT, fontWeight: '700', fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        transition: 'all 0.18s', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children} {label}
    </button>
  );
}

/* ─── HEADER DEL CAJERO ──────────────────────────────────────── */
function CajeroHeader({ user, activeTab, onTabChange, onRefresh, refreshing, onPrint, onLogout }) {
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setUserOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <header style={{
        background: C.bgAccent,
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        fontFamily: FONT,
      }}>
        <div style={{
          height: '3px',
          background: `linear-gradient(90deg, ${C.purple}, ${C.purple}88, transparent)`,
          boxShadow: 'none',
        }} />

        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
          height: '54px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>

          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: C.purple,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'none',
            }}>
              <UtensilsCrossed size={17} color="#fff" />
            </div>
            <div>
              <div style={{ color: C.cream, fontWeight: '800', fontSize: '17px', lineHeight: 1 }}>
                iTaquito
              </div>
              <div style={{
                display: 'inline-flex', marginTop: '2px',
                background: `${C.purple}22`, border: `1px solid ${C.purple}55`,
                color: C.purple, borderRadius: '10px', padding: '1px 7px',
                fontSize: '9px', fontWeight: '700', letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>
                Cajero
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Nav */}
          <NavBtn
            label="Cajero" active={activeTab === 'cajero'}
            color={C.purple} onClick={() => onTabChange('cajero')}
          >
            <DollarSign size={14} />
          </NavBtn>
          <NavBtn
            label="Canciones" active={activeTab === 'canciones'}
            color={C.teal} onClick={() => onTabChange('canciones')}
          >
            <Music size={14} />
          </NavBtn>
          <NavBtn
            label={refreshing ? 'Actualizando' : 'Actualizar'}
            active={false} color={C.teal}
            onClick={onRefresh} disabled={refreshing}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          </NavBtn>
          <NavBtn label="Imprimir" active={false} color={C.purple} onClick={onPrint}>
            <Printer size={14} />
          </NavBtn>

          <div style={{ width: '1px', height: '24px', background: C.border, margin: '0 4px', flexShrink: 0 }} />

          {/* User dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setUserOpen(o => !o)}
              style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                borderRadius: '10px', padding: '5px 10px 5px 6px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s', fontFamily: FONT,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${C.purple}66`}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: `${C.purple}33`, border: `1.5px solid ${C.purple}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.purple, fontWeight: '800', fontSize: '13px',
              }}>
                {user?.nombre?.charAt(0).toUpperCase() || 'C'}
              </div>
              <span style={{ color: C.textPrimary, fontSize: '13px', fontWeight: '600' }}>
                {user?.nombre || 'Cajero'}
              </span>
              <ChevronDown size={13} color={C.textMuted}
                style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            {userOpen && (
              <>
                <div
                  onClick={() => setUserOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: C.bgCard, border: `1px solid ${C.border}`,
                  borderRadius: '12px', padding: '6px',
                  minWidth: '190px', boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                  zIndex: 300,
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, marginBottom: '6px' }}>
                    <div style={{ color: C.textPrimary, fontWeight: '700', fontSize: '13px' }}>
                      {user?.nombre || 'Cajero'}
                    </div>
                    {user?.email && (
                      <div style={{ color: C.textMuted, fontSize: '11px', marginTop: '2px' }}>
                        {user.email}
                      </div>
                    )}
                    <div style={{
                      display: 'inline-flex', marginTop: '7px',
                      background: `${C.purple}22`, border: `1px solid ${C.purple}55`,
                      color: C.purple, borderRadius: '8px',
                      padding: '2px 9px', fontSize: '10px', fontWeight: '700',
                      letterSpacing: '0.8px', textTransform: 'uppercase',
                    }}>
                      Cajero
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: C.pink, fontFamily: FONT, fontWeight: '600', fontSize: '13px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.pink}12`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

/* ─── PAPEL PICADO ───────────────────────────────────────────── */
const PICADO = [C.pink, C.orange, C.yellow, C.teal, C.purple, C.pinkDim, C.orangeDim, C.tealDim];
function PapelPicado({ flip = false }) {
  const count = 16, w = 100 / count;
  return (
    <div style={{ width: '100%', lineHeight: 0, flexShrink: 0, transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 100 12" preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '30px' }} xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: count }).map((_, i) => {
          const x = i * w;
          return <polygon key={i} points={`${x},0 ${x + w},0 ${x + w / 2},12`} fill={PICADO[i % PICADO.length]} />;
        })}
      </svg>
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────── */
function StatCard({ label, value, sub, Icon, color }) {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '14px', padding: '16px 18px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '9px',
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '10px',
      }}>
        <Icon size={15} color={color} />
      </div>
      <div style={{ fontSize: '11px', color: C.textMuted, fontWeight: '700',
        letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: C.textPrimary, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>{sub}</div>
      )}
    </div>
  );
}

/* ─── SELECTOR DE MÉTODO DE PAGO ─────────────────────────────── */
function MetodoPagoSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '11px', color: C.textMuted, fontWeight: '700',
        letterSpacing: '0.8px', textTransform: 'uppercase',
      }}>
        Método de pago
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {Object.entries(METODO_CONFIG).map(([key, { label, Icon, color }]) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '5px',
                padding: '10px 8px',
                background: active ? `${color}20` : C.bg,
                border: `2px solid ${active ? color : C.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: active ? `0 0 12px ${color}33` : 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.background = `${color}10`;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.bg;
                }
              }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: active ? `${color}25` : `${color}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
              }}>
                <Icon size={16} color={active ? color : C.textMuted} />
              </div>
              <span style={{
                fontSize: '11px', fontWeight: active ? '700' : '600',
                color: active ? color : C.textMuted,
                fontFamily: FONT, transition: 'all 0.18s',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SESSION INDICATOR ──────────────────────────────────────── */
function SessionIndicator({ sessionStart, ordersCount }) {
  if (!sessionStart) return null;
  return (
    <span style={{
      fontSize: '11px', color: C.textMuted,
      display: 'flex', alignItems: 'center', gap: '4px',
    }}>
      <Clock size={10} />
      {fmtHora(sessionStart)} · {ordersCount} pedido{ordersCount !== 1 ? 's' : ''}
    </span>
  );
}

/* ─── MODAL DE CONFIRMACIÓN ──────────────────────────────────── */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading, confirmLabel = 'Confirmar', confirmColor = C.purple }) {
  if (!isOpen) return null;
  
  return (
    <>
      <div onClick={onCancel} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', zIndex: 500,
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', zIndex: 501,
        width: '100%', maxWidth: '400px',
        background: C.bgCard, border: `1.5px solid ${C.borderBright}`,
        borderRadius: '18px', padding: '28px 28px 24px',
        fontFamily: FONT, boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${confirmColor}18`, border: `1px solid ${confirmColor}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '14px',
        }}>
          <LogOut size={20} color={confirmColor} />
        </div>
        <h3 style={{ margin: '0 0 8px', color: C.textPrimary, fontSize: '17px', fontWeight: '800' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 24px', color: C.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, background: 'none', border: `1.5px solid ${C.border}`,
              borderRadius: '10px', padding: '11px', color: C.textSecondary,
              fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, background: confirmColor, border: 'none',
              borderRadius: '10px', padding: '11px', color: '#fff',
              fontFamily: FONT, fontWeight: '700', fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            }}
          >
            {loading
              ? <><RefreshCw size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Procesando...</>
              : confirmLabel
            }
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────── */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = type === 'success' ? C.teal : C.pink;
  const Icon  = type === 'success' ? CheckCircle : XCircle;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 600,
      background: C.bgCard, border: `1.5px solid ${color}55`,
      borderRadius: '14px', padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '10px',
      fontFamily: FONT, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${color}22`,
      animation: 'slideIn 0.3s ease', maxWidth: '340px',
    }}>
      <Icon size={18} color={color} />
      <span style={{ color: C.textPrimary, fontSize: '13px', fontWeight: '600' }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: C.textMuted,
        cursor: 'pointer', marginLeft: 'auto', padding: '2px',
      }}>
        <XCircle size={14} />
      </button>
    </div>
  );
}

/* ─── MESA CARD ──────────────────────────────────────────────── */
function MesaCard({ mesaData, onApprovePayment, onLiberateMesa, processingId }) {
  const { mesa, tokenSesion, orders, totalMesa, ordersCount, sessionStart } = mesaData;
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  const isProcessing = processingId === mesa.id;

  const estadoPriority = ['en_preparacion', 'pendiente', 'listo', 'entregado'];
  const mainEstado = orders
    .map(o => o.sEstado)
    .sort((a, b) => (estadoPriority.indexOf(a) ?? 99) - (estadoPriority.indexOf(b) ?? 99))[0];
  const estadoInfo = ESTADO_MAP[mainEstado] || { label: mainEstado, color: C.textMuted };

  return (
    <div style={{
      background: C.bgCard,
      border: `1.5px solid ${open ? C.purple + '66' : C.border}`,
      borderRadius: '16px', overflow: 'hidden',
      transition: 'all 0.2s', marginBottom: '10px',
      position: 'relative',
      boxShadow: open ? `0 8px 28px rgba(0,0,0,0.25), 0 0 20px ${C.purple}12` : '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.orange}, ${C.purple})` }} />
      {mesa.sEstado === 'en_pago' && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: C.pink, color: '#fff', borderRadius: '12px', padding: '4px 10px', fontSize: '10px', fontWeight: '800', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10 }}>
          <Bell size={12} /> PIDIENDO CUENTA
        </div>
      )}

      <div
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', cursor: 'pointer',
          background: open ? `${C.purple}08` : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: `${C.orange}18`, border: `1px solid ${C.orange}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <UtensilsCrossed size={19} color={C.orange} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: C.textPrimary }}>
              {mesa.sNombre}
            </span>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
              background: `${estadoInfo.color}20`, border: `1px solid ${estadoInfo.color}40`,
              color: estadoInfo.color, fontWeight: '700',
            }}>
              {estadoInfo.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '3px', alignItems: 'center' }}>
            {mesa.iCapacidad && (
              <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Users size={10} /> {mesa.iCapacidad} pers.
              </span>
            )}
            <SessionIndicator sessionStart={sessionStart} ordersCount={ordersCount} />
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: C.orange }}>${fmt(totalMesa)}</div>
          <div style={{ fontSize: '10px', color: C.textMuted }}>total a cobrar</div>
        </div>
        <div style={{ color: C.textMuted, flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 18px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', marginBottom: '14px' }}>
            {orders.map(order => {
              const est = ESTADO_MAP[order.sEstado] || { label: order.sEstado, color: C.textMuted };
              const ordenTotal = order.totalCalculado ?? order.dTotal ?? 0;
              return (
                <div key={order.id} style={{
                  background: C.bg, borderRadius: '12px', padding: '12px 14px',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ fontWeight: '700', color: C.textPrimary, fontSize: '13px' }}>
                        Orden #{order.id}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
                        background: `${est.color}20`, border: `1px solid ${est.color}40`,
                        color: est.color, fontWeight: '700',
                      }}>
                        {est.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: C.textMuted }}>{fmtHora(order.createdAt)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                    {(order.items || []).map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: C.textSecondary }}>
                          <span style={{
                            color: C.orange, fontWeight: '700', marginRight: '5px',
                            background: `${C.orange}15`, borderRadius: '4px', padding: '1px 5px', fontSize: '10px',
                          }}>
                            ×{item.iCantidad}
                          </span>
                          {item.producto?.sNombre || `Producto #${item.iProductoId}`}
                          {item.sNotas && (
                            <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: '5px' }}>
                              ({item.sNotas})
                            </span>
                          )}
                        </span>
                        <span style={{ color: C.textPrimary, fontWeight: '600' }}>${fmt(item.dSubtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    borderTop: `1px solid ${C.border}`, paddingTop: '7px',
                  }}>
                    <span style={{ color: C.textMuted, fontSize: '12px' }}>Subtotal</span>
                    <span style={{ color: C.orange, fontWeight: '800', fontSize: '13px' }}>${fmt(ordenTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: `${C.orange}10`, border: `1px solid ${C.orange}28`,
            borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          }}>
            <span style={{ color: C.textSecondary, fontWeight: '700', fontSize: '14px' }}>Total de la mesa</span>
            <span style={{ color: C.orange, fontWeight: '800', fontSize: '22px' }}>${fmt(totalMesa)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <MetodoPagoSelector value={paymentMethod} onChange={setPaymentMethod} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onApprovePayment(mesa.id, paymentMethod, tokenSesion)}
                disabled={isProcessing}
                style={{
                  flex: 1,
                  background: isProcessing ? C.bgCardHov : C.purple,
                  border: 'none', borderRadius: '11px', padding: '12px 22px',
                  color: isProcessing ? C.textMuted : '#fff',
                  fontFamily: FONT, fontWeight: '700', fontSize: '13px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'all 0.2s', boxShadow: isProcessing ? 'none' : glow(C.purple, '44'),
                }}
                onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.background = C.pink; }}
                onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.background = C.purple; }}
              >
                {isProcessing
                  ? <><RefreshCw size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Procesando...</>
                  : <><CheckCircle size={15} /> Aprobar pago</>
                }
              </button>

              <button
                onClick={() => onLiberateMesa(mesa.id)}
                style={{
                  background: 'none', border: `1.5px solid ${C.border}`,
                  borderRadius: '11px', padding: '12px 16px',
                  color: C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
              >
                <RefreshCw size={13} /> Liberar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── RESUMEN LATERAL DE VENTAS ──────────────────────────────── */
function SalesSummaryPanel({ summary }) {
  if (!summary) return null;
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '16px', overflow: 'hidden', marginBottom: '12px',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>Ventas del día</div>
          <div style={{ color: C.textMuted, fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} /> {fmtFecha(new Date())}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: C.teal, lineHeight: 1 }}>
            ${fmt(summary.totalVentas)}
          </div>
          <div style={{ fontSize: '11px', color: C.textMuted }}>{summary.totalOrdenes} órdenes</div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(summary.porMetodoPago || {}).map(([metodo, d]) => {
          const cfg = METODO_CONFIG[metodo] || { label: metodo, Icon: DollarSign, color: C.orange };
          const { Icon, color } = cfg;
          const pct = summary.totalVentas > 0 ? (d.total / summary.totalVentas) * 100 : 0;
          return (
            <div key={metodo}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '7px',
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color={color} />
                  </div>
                  <span style={{ fontSize: '12px', color: C.textSecondary, fontWeight: '600' }}>{cfg.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: C.textPrimary }}>${fmt(d.total)}</div>
                  <div style={{ fontSize: '10px', color: C.textMuted }}>{d.cantidad} órd.</div>
                </div>
              </div>
              <div style={{ height: '4px', background: `${color}18`, borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: color, borderRadius: '99px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── HISTORIAL LATERAL ──────────────────────────────────────── */
function HistorialPanel({ summary }) {
  const ordenes = summary?.ordenes || [];
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>Últimos pagos</div>
        <span style={{
          background: `${C.teal}18`, border: `1px solid ${C.teal}30`,
          color: C.teal, borderRadius: '20px', padding: '2px 9px',
          fontSize: '11px', fontWeight: '700',
        }}>
          hoy
        </span>
      </div>

      {ordenes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px', color: C.textMuted, fontSize: '13px' }}>
          <Receipt size={24} color={C.textMuted} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>Sin pagos registrados</div>
        </div>
      ) : (
        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {ordenes.slice().reverse().map((o, i) => {
            const cfg = METODO_CONFIG[o.metodoPago] || { label: o.metodoPago, Icon: DollarSign, color: C.orange };
            const { Icon, color } = cfg;
            return (
              <div key={o.id || i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px',
                borderBottom: i < ordenes.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                  background: `${color}15`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: C.textPrimary }}>{o.mesa}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '10px', color, fontWeight: '600',
                      background: `${color}12`, borderRadius: '5px', padding: '1px 6px',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>
                      {o.fechaPago ? fmtHora(o.fechaPago) : '—'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: C.teal, flexShrink: 0 }}>
                  ${fmt(o.total)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── TAB BUTTON ─────────────────────────────────────────────── */
function TabButton({ active, onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        background: active ? `${color}18` : 'transparent',
        border: `1.5px solid ${active ? color : 'transparent'}`,
        borderRadius: '10px', padding: '7px 16px',
        color: active ? color : C.textMuted,
        fontFamily: FONT, fontWeight: '700', fontSize: '12px',
        cursor: 'pointer', transition: 'all 0.18s',
      }}
    >
      {icon} {label}
    </button>
  );
}

/* ─── PANEL DE CANCIONES (FUNCIONAL) ─────────────────────────── */
function CancionesPanel() {
  const [queue, setQueue] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const debounceRef = useRef(null);

  const loadQueue = useCallback(async () => {
    try {
      const res = await import('../../../services/music').then(m => m.musicService.getQueue());
      setQueue(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);
  useEffect(() => {
    const t = setInterval(loadQueue, 8000);
    return () => clearInterval(t);
  }, [loadQueue]);

  const nowPlaying = queue.find(s => s.sEstado === 'reproduciendo');
  const queueRef = useRef(queue);
  const nowPlayingRef = useRef(nowPlaying);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { nowPlayingRef.current = nowPlaying; }, [nowPlaying]);

  // Audio progress tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnd = async () => { 
      setIsPlaying(false); 
      setProgress(0); 
      const np = nowPlayingRef.current;
      if (np) {
        // Marcar completada
        await import('../../../services/music').then(m => m.musicService.changeStatus(np.id, 'completada'));
        // Buscar la siguiente para reproducir automáticamente
        const q = queueRef.current;
        const nextSong = q.find(s => s.sEstado === 'en_cola' && s.id !== np.id);
        if (nextSong && nextSong.sPreviewUrl) {
          audio.src = nextSong.sPreviewUrl;
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          import('../../../services/music').then(m => m.musicService.changeStatus(nextSong.id, 'reproduciendo')).then(loadQueue);
        } else {
          loadQueue();
        }
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnd); };
  }, [loadQueue]);

  // Search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQ.trim() || searchQ.trim().length < 2) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await import('../../../services/music').then(m => m.musicService.searchTracks(searchQ.trim()));
        setSearchResults(res.data || []);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQ]);


  const handlePlay = (song) => {
    if (!song.sPreviewUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    
    // Si es la misma canción actual, hacer toggle play/pause sin reiniciar el `src`
    if (nowPlaying?.id === song.id) {
      if (isPlaying) {
        audio.pause(); 
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      // Es una canción diferente, cambiar src y reproducir
      audio.src = song.sPreviewUrl;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
      import('../../../services/music').then(m => m.musicService.changeStatus(song.id, 'reproduciendo')).then(loadQueue);
    }
  };

  const handleStatus = async (id, status, label) => {
    setActionLoading(id);
    try {
      await import('../../../services/music').then(m => m.musicService.changeStatus(id, status));
      if (status === 'completada' || status === 'descartada') {
        const audio = audioRef.current;
        if (audio) { audio.pause(); setIsPlaying(false); setProgress(0); }
      }
      setToast({ msg: label, type: 'success' });
      setTimeout(() => setToast(null), 2500);
      await loadQueue();
    } catch { setToast({ msg: 'Error al actualizar', type: 'error' }); setTimeout(() => setToast(null), 2500); }
    finally { setActionLoading(null); }
  };

  const handleStaffAdd = async (track) => {
    try {
      await import('../../../services/music').then(m => m.musicService.staffAddSong({
        spotifyTrackId: track.spotifyTrackId,
        nombre: track.nombre, artista: track.artista,
        album: track.album, imagenUrl: track.imagenUrl,
        previewUrl: track.previewUrl, duracionMs: track.duracionMs,
      }));
      setToast({ msg: `"${track.nombre}" agregada`, type: 'success' });
      setTimeout(() => setToast(null), 2500);
      setSearchQ(''); setSearchResults([]);
      await loadQueue();
    } catch { setToast({ msg: 'Error al agregar', type: 'error' }); setTimeout(() => setToast(null), 2500); }
  };

  const handleRemove = async (id) => {
    setActionLoading(id);
    try {
      await import('../../../services/music').then(m => m.musicService.removeSong(id));
      const audio = audioRef.current;
      if (audio && nowPlaying?.id === id) { audio.pause(); setIsPlaying(false); setProgress(0); }
      setToast({ msg: 'Canción descartada', type: 'success' });
      setTimeout(() => setToast(null), 2500);
      await loadQueue();
    } catch { setToast({ msg: 'Error al descartar', type: 'error' }); setTimeout(() => setToast(null), 2500); }
    finally { setActionLoading(null); }
  };

  return (
    <div>
      <audio ref={audioRef} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 600,
          background: C.bgCard, border: `1.5px solid ${toast.type === 'success' ? C.teal : C.pink}55`,
          borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: FONT, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} color={C.teal} /> : <AlertCircle size={16} color={C.pink} />}
          <span style={{ color: C.textPrimary, fontSize: '13px', fontWeight: '600' }}>{toast.msg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

        {/* Left: Now Playing + Queue */}
        <div>
          {/* Now playing card */}
          {nowPlaying ? (
            <div style={{
              background: C.bgCard, border: `1.5px solid ${C.purple}44`, borderRadius: '20px',
              overflow: 'hidden', marginBottom: '20px',
            }}>
              <div style={{ height: '4px', background: `linear-gradient(90deg, ${C.purple}, ${C.teal})` }} />
              <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                {nowPlaying.sImagenUrl && (
                  <img src={nowPlaying.sImagenUrl} alt="" style={{
                    width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: C.purple, fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ♫ Reproduciendo ahora
                  </div>
                  <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nowPlaying.sNombre}
                  </div>
                  <div style={{ color: C.textSecondary, fontSize: '13px', marginTop: '2px' }}>{nowPlaying.sArtista}</div>
                  {nowPlaying.mesa && (
                    <div style={{ fontSize: '11px', color: C.teal, fontWeight: '700', marginTop: '4px' }}>
                      Pedida por: {nowPlaying.mesa.sNombre}
                    </div>
                  )}
                  {/* Progress bar */}
                  <div style={{ height: '4px', background: `${C.purple}18`, borderRadius: '99px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: C.purple, borderRadius: '99px', transition: 'width 0.3s' }} />
                  </div>
                </div>
                {/* Controls */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {nowPlaying.sPreviewUrl && (
                    <button onClick={() => handlePlay(nowPlaying)}
                      style={{
                        width: '44px', height: '44px', borderRadius: '50%', border: 'none',
                        background: C.purple, color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                  )}
                  <button onClick={() => handleStatus(nowPlaying.id, 'completada', 'Canción completada')}
                    disabled={actionLoading === nowPlaying.id}
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      border: `1.5px solid ${C.teal}55`, background: `${C.teal}15`,
                      color: C.teal, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <CheckCircle size={18} />
                  </button>
                  <button onClick={() => handleRemove(nowPlaying.id)}
                    disabled={actionLoading === nowPlaying.id}
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      border: `1.5px solid ${C.pink}55`, background: `${C.pink}15`,
                      color: C.pink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: C.bgCard, border: `1.5px dashed ${C.border}`, borderRadius: '20px',
              padding: '32px', textAlign: 'center', marginBottom: '20px',
            }}>
              <Music size={36} color={`${C.purple}33`} style={{ marginBottom: '12px' }} />
              <div style={{ color: C.textMuted, fontSize: '14px', fontWeight: '600' }}>Sin canción reproduciéndose</div>
              <div style={{ color: C.textMuted, fontSize: '12px', marginTop: '4px' }}>Selecciona una canción de la cola para reproducir</div>
            </div>
          )}

          {/* Queue */}
          <div style={{
            background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.teal }} />
              <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>Cola de canciones</span>
              <span style={{
                marginLeft: 'auto', background: `${C.teal}15`, border: `1px solid ${C.teal}33`,
                color: C.teal, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: '800',
              }}>{queue.filter(s => s.sEstado === 'en_cola').length} en espera</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <RefreshCw size={24} color={C.purple} style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : queue.filter(s => s.sEstado === 'en_cola').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
                <Sparkles size={28} color={`${C.teal}33`} style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px' }}>La cola está vacía</div>
              </div>
            ) : (
              <div>
                {queue.filter(s => s.sEstado === 'en_cola').map((song, i) => (
                  <div key={song.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px',
                    borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgCardHov}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                      background: `${C.teal}15`, border: `1px solid ${C.teal}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: C.teal, fontWeight: '800', fontSize: '11px',
                    }}>{i + 1}</span>
                    {song.sImagenUrl && (
                      <img src={song.sImagenUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.textPrimary, fontWeight: '700', fontSize: '13px',  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.sNombre}</div>
                      <div style={{ color: C.textMuted, fontSize: '11px' }}>{song.sArtista}</div>
                    </div>
                    {song.mesa && (
                      <span style={{ fontSize: '10px', color: C.teal, fontWeight: '700', background: `${C.teal}12`, borderRadius: '8px', padding: '2px 8px', flexShrink: 0 }}>
                        {song.mesa.sNombre}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => handlePlay(song)} title="Reproducir"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${C.purple}44`, background: `${C.purple}12`, color: C.purple, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        ▶
                      </button>
                      <button onClick={() => handleRemove(song.id)} title="Descartar"
                        disabled={actionLoading === song.id}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${C.pink}44`, background: `${C.pink}12`, color: C.pink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Staff search to add songs */}
        <div style={{ position: 'sticky', top: '70px' }}>
          <div style={{
            background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.purple }} />
              <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>Agregar canción</span>
            </div>

            <div style={{ padding: '12px' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={14} color={C.textMuted} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Buscar canción..."
                  style={{
                    width: '100%', boxSizing: 'border-box', background: C.bg,
                    border: `1px solid ${C.border}`, borderRadius: '9px',
                    padding: '9px 10px 9px 30px', color: C.textPrimary,
                    fontFamily: FONT, fontWeight: '600', fontSize: '12px', outline: 'none',
                  }}
                />
              </div>

              {searching && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <RefreshCw size={16} color={C.purple} style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}

              <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {searchResults.map(track => (
                  <div key={track.spotifyTrackId} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                    borderRadius: '10px', transition: 'background 0.15s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgCardHov}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {track.imagenUrl && (
                      <img src={track.imagenUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.textPrimary, fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.nombre}</div>
                      <div style={{ color: C.textMuted, fontSize: '10px' }}>{track.artista}</div>
                    </div>
                    <button onClick={() => handleStaffAdd(track)}
                      style={{
                        background: `${C.teal}15`, border: `1px solid ${C.teal}44`,
                        borderRadius: '7px', padding: '5px 10px', color: C.teal,
                        fontFamily: FONT, fontWeight: '700', fontSize: '11px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HISTORIAL EXPANDIDO ────────────────────────────────────── */
function HistorialExpandido({ summary }) {
  const ordenes = summary?.ordenes || [];
  return (
    <div style={{
      background: C.bgCard, border: `1.5px solid ${C.border}`,
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '15px' }}>Historial de pagos</div>
          <div style={{ color: C.textMuted, fontSize: '12px', marginTop: '2px' }}>
            {ordenes.length} transacción{ordenes.length !== 1 ? 'es' : ''} hoy
          </div>
        </div>
        {ordenes.length > 0 && (
          <span style={{
            background: `${C.teal}18`, border: `1px solid ${C.teal}35`,
            color: C.teal, borderRadius: '20px', padding: '4px 12px',
            fontSize: '13px', fontWeight: '700',
          }}>
            ${fmt(summary?.totalVentas)}
          </span>
        )}
      </div>

      {ordenes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted, fontSize: '13px' }}>
          <Receipt size={28} color={C.textMuted} style={{ marginBottom: '10px', opacity: 0.4 }} />
          <div>Sin pagos registrados hoy</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ordenes.slice().reverse().map((o, i) => {
            const cfg = METODO_CONFIG[o.metodoPago] || { label: o.metodoPago, Icon: DollarSign, color: C.orange };
            const { Icon, color } = cfg;
            return (
              <div key={o.id || i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '13px 20px',
                borderBottom: i < ordenes.length - 1 ? `1px solid ${C.border}` : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgCardHov}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: `${color}15`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: C.textPrimary, fontWeight: '700', fontSize: '14px' }}>{o.mesa}</span>
                    <span style={{ color: C.teal, fontWeight: '800', fontSize: '15px' }}>${fmt(o.total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px', color, fontWeight: '600',
                      background: `${color}12`, borderRadius: '6px', padding: '1px 7px',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarDays size={10} />
                      {o.fechaPago ? fmtHora(o.fechaPago) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CAJERO PANEL PRINCIPAL
═══════════════════════════════════════════════════════════════ */
const CajeroPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersByTable, setOrdersByTable] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('cajero');
  const [subTab, setSubTab] = useState('cuentas');

  const [confirmModal, setConfirmModal] = useState({
    open: false, title: '', message: '', onConfirm: null, loading: false,
    confirmLabel: 'Confirmar', confirmColor: C.purple,
  });

  useEffect(() => {
    if (user && user.rol !== 'cajero' && user.rol !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [ordersData, summaryData] = await Promise.all([
        cajeroService.getOrdersByTable(filter),
        cajeroService.getSalesSummary(),
      ]);
      setOrdersByTable(ordersData.data || []);
      setSummary(summaryData.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); loadData(); }, [loadData]);

  useEffect(() => {
    const t = setInterval(() => {
      if (activeTab === 'cajero') loadData();
    }, 30000);
    return () => clearInterval(t);
  }, [loadData, activeTab]);

  const handleRefresh = async () => { setRefreshing(true); await loadData(); };
  const handlePrint = () => window.print();
  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ── LOGOUT CON CONFIRMACIÓN ── */
  const handleLogout = useCallback(() => {
    setConfirmModal({
      open: true,
      title: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder al panel.',
      confirmLabel: 'Sí, cerrar sesión',
      confirmColor: C.pink,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, loading: true }));
        try {
          await logout();
          setOrdersByTable([]);
          setSummary(null);
          setError(null);
          navigate('/login');
        } catch (error) {
          console.error('Error en logout:', error);
          showToast('Error al cerrar sesión. Por favor intenta de nuevo.', 'error');
          setConfirmModal(p => ({ ...p, open: false, loading: false }));
        }
      },
    });
  }, [logout, navigate]);

  const handleApprovePayment = (mesaId, metodoPago, sTokenSesion) => {
    const mesa = ordersByTable.find(t => t.mesa.id === mesaId);
    const cfg = METODO_CONFIG[metodoPago] || { label: metodoPago };
    setConfirmModal({
      open: true,
      title: `Aprobar pago — ${mesa?.mesa?.sNombre}`,
      message: `¿Confirmar pago de $${fmt(mesa?.totalMesa)} con ${cfg.label}? Se marcarán todas las órdenes como pagadas y se liberará la mesa para una nueva sesión.`,
      confirmLabel: '✓ Confirmar pago',
      confirmColor: C.purple,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, loading: true }));
        setProcessingId(mesaId);
        try {
          await cajeroService.approvePayment(mesaId, metodoPago, sTokenSesion);
          setConfirmModal(p => ({ ...p, open: false }));
          showToast(` Pago de ${mesa?.mesa?.sNombre} aprobado correctamente`);
          await loadData();
        } catch (err) {
          console.error('Error al aprobar pago:', err);
          showToast(err.response?.data?.message || 'Error al procesar el pago', 'error');
          setConfirmModal(p => ({ ...p, loading: false }));
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleLiberateMesa = (mesaId) => {
    const mesa = ordersByTable.find(t => t.mesa.id === mesaId);
    setConfirmModal({
      open: true,
      title: `Liberar ${mesa?.mesa?.sNombre}`,
      message: 'Las órdenes pendientes quedarán sin cobrar. ¿Deseas continuar?',
      confirmLabel: 'Liberar mesa',
      confirmColor: C.teal,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, loading: true }));
        try {
          await cajeroService.changeTableStatus(mesaId, 'disponible');
          setConfirmModal(p => ({ ...p, open: false }));
          showToast(`${mesa?.mesa?.sNombre} liberada correctamente`);
          await loadData();
        } catch (err) {
          console.error('Error al liberar mesa:', err);
          showToast('Error al liberar la mesa.', 'error');
          setConfirmModal(p => ({ ...p, loading: false }));
        }
      },
    });
  };

  const totalPendiente = ordersByTable.reduce((s, t) => s + t.totalMesa, 0);
  const mesasListas    = ordersByTable.filter(t => t.orders.every(o => o.sEstado === 'listo' || o.sEstado === 'entregado')).length;
  const mesasEnPrep    = ordersByTable.length - mesasListas;

  const FILTROS = [
    { value: 'todos',          label: 'Todas'          },
    { value: 'pendiente',      label: 'Pendientes'     },
    { value: 'en_preparacion', label: 'En preparación' },
    { value: 'listo',          label: 'Listas'         },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>

      <CajeroHeader
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onPrint={handlePrint}
        onLogout={handleLogout}
      />

      <PapelPicado />

      {/* Hero */}
      <div style={{
        background: C.bg, padding: '24px 24px 20px',
        textAlign: 'center', borderBottom: `1px solid ${C.border}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', left: '10%', width: '260px', height: '260px',
          borderRadius: '50%', background: `${C.purple}08`, filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '-60px', right: '10%', width: '220px', height: '220px',
          borderRadius: '50%', background: `${C.pink}08`, filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{
            margin: '0 0 5px', fontSize: 'clamp(22px, 4vw, 34px)',
            fontWeight: '800', color: C.purple, letterSpacing: '-0.5px',
          }}>
            Panel de Cajero
          </h1>
          <p style={{ margin: 0, color: C.textSecondary, fontSize: '13px' }}>
            {loading
              ? 'Cargando...'
              : `${ordersByTable.length} mesa${ordersByTable.length !== 1 ? 's' : ''} con cuentas pendientes`
            }
          </p>
        </div>
      </div>

      <PapelPicado flip />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <Breadcrumb />

        {activeTab === 'cajero' ? (
          <>
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px', marginBottom: '24px',
            }}>
              <StatCard label="Ventas hoy"      value={`$${fmt(summary?.totalVentas)}`} sub={`${summary?.totalOrdenes ?? 0} órdenes`}           Icon={TrendingUp}   color={C.teal}   />
              <StatCard label="Por cobrar"       value={`$${fmt(totalPendiente)}`}        sub={`${ordersByTable.length} mesa${ordersByTable.length !== 1 ? 's' : ''} activas`} Icon={ClipboardList} color={C.orange} />
              <StatCard label="Mesas listas"     value={mesasListas}                      sub="listas para cobrar"                                Icon={CheckCircle}  color={C.teal}   />
              <StatCard label="En preparación"   value={mesasEnPrep}                      sub="aún cocinando"                                     Icon={RefreshCw}    color={C.purple} />
            </div>

            {/* Dos columnas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 300px',
              gap: '16px', alignItems: 'start',
            }}>
              {/* Columna izquierda */}
              <div>
                <div style={{
                  display: 'flex', gap: '4px', marginBottom: '16px',
                  background: C.bgCard, border: `1px solid ${C.border}`,
                  borderRadius: '12px', padding: '4px', width: 'fit-content',
                }}>
                  <TabButton active={subTab === 'cuentas'}   onClick={() => setSubTab('cuentas')}   icon={<AlertCircle size={13} />} label="Cuentas pendientes" color={C.orange} />
                  <TabButton active={subTab === 'historial'} onClick={() => setSubTab('historial')} icon={<History size={13} />}     label="Historial del día"  color={C.teal}   />
                </div>

                {subTab === 'cuentas' ? (
                  <>
                    {/* Filtros */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {FILTROS.map(f => (
                        <button key={f.value} onClick={() => setFilter(f.value)} style={{
                          background: filter === f.value ? C.purple : C.bgCard,
                          border: `1.5px solid ${filter === f.value ? C.purple : C.border}`,
                          borderRadius: '20px', padding: '5px 16px',
                          color: filter === f.value ? '#fff' : C.textSecondary,
                          fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                          fontFamily: FONT, transition: 'all 0.18s',
                          boxShadow: filter === f.value ? glow(C.purple, '33') : 'none',
                        }}>
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Banner total */}
                    {ordersByTable.length > 0 && (
                      <div style={{
                        background: C.bgCard, border: `1px solid ${C.border}`,
                        borderLeft: `4px solid ${C.orange}`,
                        borderRadius: '12px', padding: '12px 18px', marginBottom: '16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={15} color={C.orange} />
                          <span style={{ color: C.textSecondary, fontSize: '13px', fontWeight: '600' }}>
                            Total pendiente por cobrar
                          </span>
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: C.orange }}>
                          ${fmt(totalPendiente)}
                        </span>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div style={{
                        background: `${C.pink}12`, border: `1px solid ${C.pink}40`,
                        borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                        color: C.pink, fontSize: '13px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <AlertCircle size={14} /> {error}
                      </div>
                    )}

                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <RefreshCw size={28} color={C.purple} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
                        <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Cargando cuentas pendientes...</p>
                      </div>
                    ) : ordersByTable.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        background: C.bgCard, borderRadius: '18px', border: `1.5px solid ${C.border}`,
                      }}>
                        <div style={{
                          width: '64px', height: '64px', borderRadius: '16px',
                          background: `${C.teal}15`, border: `1.5px solid ${C.teal}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto 16px', boxShadow: glow(C.teal, '22'),
                        }}>
                          <CheckCircle size={28} color={C.teal} />
                        </div>
                        <h3 style={{ color: C.textPrimary, margin: '0 0 7px', fontWeight: '800', fontSize: '17px' }}>¡Todo al día!</h3>
                        <p style={{ color: C.textMuted, margin: 0, fontSize: '13px' }}>No hay cuentas pendientes por cobrar</p>
                      </div>
                    ) : (
                      <div>
                        {ordersByTable.map(tableData => (
                          <MesaCard
                            key={tableData.mesa.id}
                            mesaData={tableData}
                            onApprovePayment={handleApprovePayment}
                            onLiberateMesa={handleLiberateMesa}
                            processingId={processingId}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <HistorialExpandido summary={summary} />
                )}
              </div>

              {/* Columna derecha sticky */}
              <div style={{ position: 'sticky', top: '70px' }}>
                <SalesSummaryPanel summary={summary} />
                <HistorialPanel summary={summary} />
              </div>
            </div>
          </>
        ) : (
          <CancionesPanel />
        )}
      </main>

      {/* Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => !confirmModal.loading && setConfirmModal(p => ({ ...p, open: false }))}
        loading={confirmModal.loading}
        confirmLabel={confirmModal.confirmLabel}
        confirmColor={confirmModal.confirmColor}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 49, 115, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(224, 49, 115, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 49, 115, 0); }
        }
        @media (max-width: 860px) {
          .cajero-two-col { grid-template-columns: 1fr !important; }
          .cajero-sidebar  { display: none !important; }
        }
        @media print {
          header, button, .no-print { display: none; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
};

export default CajeroPanel;

