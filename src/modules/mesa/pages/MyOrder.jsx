import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ordersService } from '../../../services/orders';
import { tablesService } from '../../../services/tables';
import { C, FONT, glow } from '../../../styles/designTokens';
import { usePedirCuenta } from '../../../hooks/usePedirCuenta';
import { PayConfirmModal } from '../components/PayConfirmModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import {
  ShoppingBag, UtensilsCrossed, Trash2, Plus, Minus,
  ChevronRight, CheckCircle, Receipt, AlertCircle,
  Loader, LogOut, MapPin, Utensils, ClipboardList, Pencil, X, Music, BellRing,
} from 'lucide-react';
import { EmojiRatingModal } from '../components/EmojiRatingModal';
import { TicketShareModal } from '../components/TicketShareModal';

/* ─── PAPEL PICADO ───────────────────────────────────────────── */
const PICADO = [C.pink, C.orange, C.yellow, C.teal, C.purple, C.pinkDim, C.orangeDim, C.tealDim];
function PapelPicado({ flip = false }) {
  const count = 16, w = 100 / count;
  return (
    <div style={{ width: '100%', lineHeight: 0, flexShrink: 0, transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 100 12" preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '36px' }} xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: count }).map((_, i) => {
          const x = i * w;
          return <polygon key={i} points={`${x},0 ${x + w},0 ${x + w / 2},12`} fill={PICADO[i % PICADO.length]} />;
        })}
      </svg>
    </div>
  );
}

/* ─── NAV BUTTON ─────────────────────────────────────────────── */
function NavBtn({ label, active, color, onClick, children }) {
  const [hov, setHov] = useState(false);
  const c = color || C.teal;
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active ? `${c}18` : hov ? C.bgCardHov : 'transparent',
        border: `1.5px solid ${active ? c + '55' : hov ? C.border : 'transparent'}`,
        borderRadius: '8px', padding: '6px 12px',
        color: active ? c : hov ? C.textPrimary : C.textSecondary,
        fontFamily: FONT, fontWeight: '700', fontSize: '12px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
        transition: 'all 0.18s', flexShrink: 0,
      }}>
      {children} {label}
    </button>
  );
}

/* ─── CLIENT HEADER ──────────────────────────────────────────── */
function ClientHeader({ onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, iMesaId, mesaNombre, logout } = useAuth();
  const { totalItems } = useCart();
  const isMesero = user?.rol === 'mesero';

  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState(null); // 'idle' | 'calling' | 'success' | 'error'

  const handleLlamar = async () => {
    if (!iMesaId || isCalling) return;
    setIsCalling(true);
    setCallStatus('calling');
    try {
      await tablesService.llamarMesero(iMesaId, 'Mi Pedido');
      setCallStatus('success');
      setTimeout(() => {
        setCallStatus(null);
        setIsCalling(false);
      }, 4000);
    } catch (e) {
      console.error(e);
      setCallStatus('error');
      setTimeout(() => {
        setCallStatus(null);
        setIsCalling(false);
      }, 4000);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    else setShowLogoutModal(true);
  };

  return (
    <>
      <header style={{ background: C.bgAccent, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 16px rgba(0,0,0,0.4)', fontFamily: FONT }}>
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.teal}, ${C.teal}88, transparent)`, boxShadow: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '54px', display: 'flex', alignItems: 'center', gap: '12px' }}>
  
          <div onClick={() => navigate('/menu')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${C.teal}22`, border: `1.5px solid ${C.teal}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glow(C.teal, '33') }}>
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
  
          <NavBtn label="Menú" active={pathname === '/menu'} color={C.teal} onClick={() => navigate('/menu')}>
            <UtensilsCrossed size={14} />
          </NavBtn>
  
          <NavBtn label="Rockola" active={pathname === '/rockola'} color={C.purple} onClick={() => navigate('/rockola')}>
            <Music size={14} />
          </NavBtn>
  
          {!isMesero && (
            <>
              <NavBtn label="Mi Pedido" active={pathname === '/my-order'} color={C.pink} onClick={() => navigate('/my-order')}>
                <ShoppingBag size={14} />
                {totalItems > 0 && (
                  <span style={{ background: C.pink, color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {totalItems}
                  </span>
                )}
              </NavBtn>
  
              <NavBtn label="Mis Pedidos" active={pathname === '/my-orders'} color={C.purple} onClick={() => navigate('/my-orders')}>
                <ClipboardList size={14} />
              </NavBtn>
            </>
          )}
  
          {(mesaNombre || iMesaId) && !isMesero && iMesaId !== null && iMesaId !== undefined && (
            <button 
              disabled={isCalling}
              onClick={handleLlamar}
              style={{ 
                background: callStatus === 'success' ? `${C.teal}12` : callStatus === 'error' ? `${C.pink}12` : `${C.orange}12`, 
                border: `1px solid ${callStatus === 'success' ? C.teal : callStatus === 'error' ? C.pink : C.orange}33`, 
                borderRadius: '8px', padding: '6px 12px', 
                color: callStatus === 'success' ? C.teal : callStatus === 'error' ? C.pink : C.orange, 
                fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: isCalling ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.18s' 
              }}
              onMouseEnter={e => { if(!isCalling) { e.currentTarget.style.background = `${C.orange}22`; e.currentTarget.style.borderColor = C.orange; } }}
              onMouseLeave={e => { if(!isCalling) { e.currentTarget.style.background = `${C.orange}12`; e.currentTarget.style.borderColor = `${C.orange}33`; } }}>
              {callStatus === 'calling' ? (
                <Loader size={13} style={{ animation: 'spin 1.5s linear infinite' }} />
              ) : callStatus === 'success' ? (
                <CheckCircle size={13} />
              ) : (
                <BellRing size={13} />
              )}
              {callStatus === 'calling' ? 'Llamando...' : callStatus === 'success' ? '¡Notificado!' : callStatus === 'error' ? 'Reintentar' : 'Llamar Mesero'}
            </button>
          )}
  
          <button onClick={handleLogoutClick}
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
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        title="¿Cerrar sesión?"
        message="Se cerrará tu sesión en esta mesa. Tus pedidos activos seguirán en proceso."
      />
    </>
  );
}

/* ─── ITEM CARD ───────────────────────────────────────────────── */
function ItemCard({ item, onIncrement, onDecrement, onRemove }) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const subtotal = (parseFloat(item.precio) * item.qty).toFixed(2);

  return (
    <>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', transition: 'border-color 0.2s' }}>
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: `${C.pink}12`, border: `1px solid ${C.pink}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UtensilsCrossed size={22} color={C.pinkDim} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', color: C.textPrimary, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
          <div style={{ color: C.pink, fontWeight: '700', fontSize: '13px', marginTop: '2px' }}>${(parseFloat(item.precio)).toFixed(2)} c/u</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button onClick={() => onDecrement(item.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: `1.5px solid ${C.border}`, background: 'transparent', color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.pink; e.currentTarget.style.color = C.pink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
            <Minus size={12} />
          </button>
          <span style={{ fontWeight: '800', color: C.textPrimary, fontSize: '15px', minWidth: '22px', textAlign: 'center' }}>{item.qty}</span>
          <button onClick={() => onIncrement(item)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: `1.5px solid ${C.pink}55`, background: `${C.pink}12`, color: C.pink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.pink}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${C.pink}12`; }}>
            <Plus size={12} />
          </button>
        </div>
        <div style={{ minWidth: '60px', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ color: C.orange, fontWeight: '800', fontSize: '14px' }}>${subtotal}</div>
          <button
            onClick={() => setShowRemoveModal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '2px', marginTop: '2px', display: 'inline-flex' }}
            onMouseEnter={e => e.currentTarget.style.color = C.pink}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={() => { setShowRemoveModal(false); onRemove(item.id); }}
        title="¿Quitar producto?"
        message={`¿Deseas eliminar "${item.nombre}" de tu plato?`}
      />
    </>
  );
}

/* ─── EMPTY CART ─────────────────────────────────────────────── */
function EmptyCart({ onGoMenu }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: `${C.pink}12`, border: `1.5px solid ${C.pink}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <ShoppingBag size={32} color={C.pinkDim} />
      </div>
      <h3 style={{ color: C.textPrimary, margin: '0 0 8px', fontWeight: '800', fontSize: '18px' }}>Este plato está vacío</h3>
      <p style={{ color: C.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>Agrega productos desde el menú</p>
      <button onClick={onGoMenu} style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: glow(C.pink) }}>
        <UtensilsCrossed size={16} /> Ir al menú
      </button>
    </div>
  );
}

/* ─── ORDER SUCCESS ──────────────────────────────────────────── */
function OrderSuccess({ onGoMenu, onViewOrders, platosEnviados }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: `${C.teal}15`, border: `1.5px solid ${C.teal}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'scaleIn 0.5s ease' }}>
        <CheckCircle size={40} color={C.teal} />
      </div>
      <h2 style={{ color: C.textPrimary, margin: '0 0 8px', fontSize: '26px', fontWeight: '900' }}>¡Pedido enviado!</h2>
      <p style={{ color: C.textSecondary, fontSize: '15px', margin: '0 0 6px' }}>
        {platosEnviados > 1 ? `${platosEnviados} platos enviados a cocina` : 'Tu plato fue enviado a cocina'}
      </p>
      <p style={{ color: C.textMuted, fontSize: '13px', margin: '0 0 32px' }}>El cocinero lo preparará en breve</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onViewOrders} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: glow(C.teal) }}>
          <ClipboardList size={16} /> Ver mis pedidos
        </button>
        <button onClick={onGoMenu} style={{ background: 'transparent', color: C.textSecondary, border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '12px 24px', fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <UtensilsCrossed size={16} /> Seguir en el menú
        </button>
      </div>
    </div>
  );
}

/* ─── PLATE TAB ──────────────────────────────────────────────── */
function PlateTab({ plate, active, itemCount, onSelect, onRemove, onRename, canRemove }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(plate.label);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (label.trim()) onRename(plate.id, label.trim());
    setEditing(false);
  };

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
        background: active ? `${C.pink}15` : C.bgCard,
        border: `1.5px solid ${active ? C.pink : C.border}`,
        borderRadius: '12px', padding: '6px 10px',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: active ? glow(C.pink, '33') : 'none',
      }} onClick={() => !editing && onSelect(plate.id)}>
        {editing ? (
          <form onSubmit={handleRenameSubmit} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              autoFocus value={label} onChange={e => setLabel(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: C.textPrimary, fontFamily: FONT, fontWeight: '700', fontSize: '12px', width: '80px' }}
              onBlur={handleRenameSubmit}
            />
          </form>
        ) : (
          <span style={{ color: active ? C.pink : C.textSecondary, fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' }}>
            {plate.label}
          </span>
        )}

        {itemCount > 0 && (
          <span style={{ background: active ? C.pink : C.textMuted, color: '#fff', borderRadius: '99px', padding: '0 5px', fontSize: '9px', fontWeight: '900', minWidth: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {itemCount}
          </span>
        )}

        {active && !editing && (
          <button onClick={e => { e.stopPropagation(); setEditing(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '1px', display: 'flex' }}>
            <Pencil size={9} />
          </button>
        )}

        {canRemove && (
          <button
            onClick={e => { e.stopPropagation(); setShowRemoveModal(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '1px', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = C.pink}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}>
            <X size={11} />
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={() => { setShowRemoveModal(false); onRemove(plate.id); }}
        title="¿Eliminar plato?"
        message={`¿Deseas eliminar "${plate.label}" y todos sus productos?`}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MY ORDER PAGE
═══════════════════════════════════════════════════════════════ */
const MyOrder = () => {
  const navigate = useNavigate();
  const { user, logout, getMesaId, mesaNombre, setMesaEstado } = useAuth();
  const {
    plates, activePlateId, activePlate,
    addPlate, removePlate, renamePlate, setActivePlate,
    items, addItem, decrementItem, removeItem,
    clearAllPlates,
    totalItems, totalPrecio,
  } = useCart();

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderingNow,    setOrderingNow]    = useState(false);
  const [orderSuccess,   setOrderSuccess]   = useState(false);
  const [orderModalErr,  setOrderModalErr]  = useState('');
  const [animatingEnd,   setAnimatingEnd]   = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [ticketItems,    setTicketItems]    = useState([]);
  const [ticketTotal,    setTicketTotal]    = useState(0);
  const [showPayModal,   setShowPayModal]   = useState(false);
  
  // ── Emoji Rating ──
  const [showEmojiRating, setShowEmojiRating]  = useState(false);
  const [pendingAction,   setPendingAction]    = useState(null); // 'logout' | 'pay'

  const iMesaId = getMesaId();

  const { ejecutar: ejecutarPedirCuenta, loading: payLoading, error: payError, clearError: clearPayError } = usePedirCuenta({
    iMesaId,
    onEnPago: useCallback(() => {
      setTimeout(() => { if (typeof setMesaEstado === 'function') setMesaEstado('en_pago'); setAnimatingEnd(false); }, 2000);
    }, [setMesaEstado]),
    onDisponible: useCallback(() => {
      setTimeout(() => { 
        if (typeof setMesaEstado === 'function') setMesaEstado('disponible'); 
        setAnimatingEnd(false); 
        clearAllPlates();
      }, 2000);
    }, [clearAllPlates, setMesaEstado]),
  });

  const handleAbrirPayModal  = () => { clearPayError(); setShowPayModal(true); };
  const handleCerrarPayModal = () => { if (!payLoading) setShowPayModal(false); };
  const handleConfirmarPago  = async () => {
    setAnimatingEnd(true);
    const ok = await ejecutarPedirCuenta();
    if (ok) {
      setShowPayModal(false);
      try {
        const token = localStorage.getItem('mesaSessionToken');
        // Usar siempre el token si existe para no mezclar sesiones
        const data = await ordersService.getAll({ iMesaId, sTokenSesion: token });
        let orders = data?.data || [];
        
        console.log('MyOrder Ticket - Orders found:', orders.length);

        const formatted = orders
          .filter(o => o.sEstado !== 'cancelado')
          .flatMap(order => 
            (order.items || []).map(i => ({
              nombre: i.producto?.sNombre || 'Producto',
              precio: parseFloat(i.dPrecioHistorico || i.producto?.dPrecio || 0),
              qty: i.iCantidad
            }))
          );
        const total = formatted.reduce((acc, i) => acc + (i.precio * i.qty), 0);
        console.log('MyOrder Ticket - Items formatted:', formatted.length);
        
        if (formatted.length > 0) {
          setTicketItems(formatted);
          setTicketTotal(total);
          setAnimatingEnd(false);
          setShowEmailModal(true);
        } else {
          throw new Error('No items');
        }
      } catch (e) {
        setAnimatingEnd(false);
        setPendingAction('pay');
        setShowEmojiRating(true);
      }
    } else {
      setAnimatingEnd(false);
    }
  };



  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setPendingAction('pay');
    setShowEmojiRating(true);
  };

  const handleLogoutRequest = () => {
    setPendingAction('logout');
    setShowEmojiRating(true);
  };

  const handleEmojiComplete = () => {
    setShowEmojiRating(false);
    if (pendingAction === 'logout') {
      logout();
    }
    setPendingAction(null);
  };

  const nonEmptyPlates = plates.filter(p => p.items.length > 0);

  const handleQuickOrder = async () => {
    if (nonEmptyPlates.length === 0 || !iMesaId) return;
    const sessionToken = localStorage.getItem('mesaSessionToken');
    setOrderingNow(true);
    try {
      for (const plate of nonEmptyPlates) {
        await ordersService.create({
          iMesaId,
          items: plate.items.map(i => ({ iProductoId: i.id, iCantidad: i.qty })),
          sTokenSesion: sessionToken,
          sNombrePlato: plate.label,
        });
      }
      clearAllPlates();
      setShowOrderModal(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 2500);
    } catch (e) {
      setOrderModalErr('Hubo un error al enviar el pedido. Intenta de nuevo.');
    } finally {
      setOrderingNow(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      <TicketShareModal 
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        items={ticketItems}
        total={ticketTotal}
        tableName={localStorage.getItem('meseroMesaNombre') || 'Mesa'}
      />
      <ClientHeader onLogout={handleLogoutRequest} />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 24px 140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '26px', borderRadius: '2px', background: C.pink, boxShadow: glow(C.pink) }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(20px,4vw,26px)', fontWeight: '800', color: C.textPrimary, lineHeight: 1.1 }}>
              {mesaNombre ? `Pedido — ${mesaNombre}` : 'Mi Pedido'}
            </h1>
            <p style={{ margin: 0, color: C.textMuted, fontSize: '12px' }}>
              {plates.length} plato{plates.length !== 1 ? 's' : ''} · {totalItems} producto{totalItems !== 1 ? 's' : ''} · Total ${totalPrecio.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ─── PLATE TABS ─── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scroll">
            {plates.map(plate => (
              <PlateTab
                key={plate.id} plate={plate}
                active={plate.id === activePlateId}
                itemCount={plate.items.length}
                onSelect={setActivePlate}
                onRemove={removePlate}
                onRename={renamePlate}
                canRemove={plates.length > 1}
              />
            ))}
            <button onClick={addPlate}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: `1.5px dashed ${C.border}`, borderRadius: '12px', padding: '6px 12px', color: C.textMuted, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}>
              <Plus size={12} /> Nuevo plato
            </button>
          </div>
          <div style={{ height: '1px', background: C.border }} />
        </div>

        {/* ─── ITEMS DEL PLATO ACTIVO ─── */}
        {items.length === 0 ? (
          <EmptyCart onGoMenu={() => navigate('/menu')} />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ width: '3px', height: '14px', borderRadius: '2px', background: C.pink }} />
              <span style={{ color: C.textSecondary, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {activePlate?.label}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {items.map(item => (
                <ItemCard key={item.id} item={item} onIncrement={addItem} onDecrement={decrementItem} onRemove={removeItem} />
              ))}
            </div>
          </>
        )}

        {/* ─── RESUMEN GLOBAL ─── */}
        {nonEmptyPlates.length > 0 && (
          <>
            <PapelPicado />
            <div style={{ background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px', padding: '20px', margin: '24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: C.yellow, boxShadow: glow(C.yellow) }} />
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: C.textPrimary }}>Resumen total</h2>
                <Receipt size={14} color={C.textMuted} style={{ marginLeft: 'auto' }} />
              </div>
              {nonEmptyPlates.map((plate, idx) => {
                const subtotal = plate.items.reduce((s, i) => s + i.precio * i.qty, 0);
                return (
                  <div key={plate.id} style={{ marginBottom: idx < nonEmptyPlates.length - 1 ? '12px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ color: C.textSecondary, fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.orange }} />
                        {plate.label}
                      </span>
                      <span style={{ color: C.orange, fontWeight: '700', fontSize: '13px' }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '13px' }}>
                      {plate.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: C.textMuted, fontSize: '12px' }}>{item.nombre} <span style={{ color: C.textMuted }}>×{item.qty}</span></span>
                          <span style={{ color: C.textMuted, fontSize: '12px' }}>${(item.precio * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ height: '1px', background: C.border, margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: C.textPrimary, fontWeight: '700', fontSize: '15px' }}>Total</span>
                <span style={{ color: C.yellow, fontWeight: '800', fontSize: '22px' }}>${totalPrecio.toFixed(2)}</span>
              </div>
            </div>
            <PapelPicado flip />
          </>
        )}
      </main>

      {/* ─── BARRA INFERIOR FIJA ─── */}
      {nonEmptyPlates.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.bgAccent, borderTop: `1px solid ${C.border}`, padding: '12px 24px 16px', display: 'flex', gap: '10px', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)', zIndex: 100, fontFamily: FONT }}>
          <button onClick={() => navigate('/menu')}
            style={{ flex: '0 0 auto', background: C.bgCard, color: C.textSecondary, border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '12px 18px', fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.pink; e.currentTarget.style.color = C.pink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}>
            <UtensilsCrossed size={15} /> Ver menú
          </button>
          <button onClick={() => { setOrderModalErr(''); setShowOrderModal(true); }}
            style={{ flex: 1, background: C.teal, color: '#fff', border: `1.5px solid ${C.teal}`, borderRadius: '10px', padding: '12px 20px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: glow(C.teal, '55') }}>
            <ChevronRight size={16} /> Ordenar {nonEmptyPlates.length} plato{nonEmptyPlates.length !== 1 ? 's' : ''} — ${totalPrecio.toFixed(2)}
          </button>
        </div>
      )}

      {/* Botón fijo Pedir Cuenta */}
      <button onClick={handleAbrirPayModal}
        style={{ position: 'fixed', bottom: nonEmptyPlates.length > 0 ? '82px' : '24px', left: '24px', background: C.orange, color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 20px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 8px 24px rgba(0,0,0,0.4), ${glow(C.orange, '66')}`, zIndex: 150, transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <ClipboardList size={18} /> Pedir Cuenta
      </button>

      {/* Modal confirmar pedido */}
      {showOrderModal && (
        <div onClick={() => { if (!orderingNow) setShowOrderModal(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9995, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 24px', fontFamily: FONT }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '460px', boxShadow: '0 -12px 48px rgba(0,0,0,0.5)', animation: 'slideUp 0.22s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: C.textPrimary }}>Confirmar pedido</h3>
              {!orderingNow && <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '4px', display: 'flex' }}><X size={18} /></button>}
            </div>
            <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }} className="hide-scroll">
              {nonEmptyPlates.map((plate, idx) => (
                <div key={plate.id} style={{ background: C.bg, borderRadius: '12px', padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', color: [C.pink, C.teal, C.orange, C.purple, C.yellow][idx % 5] }}>{plate.label}</span>
                    <span style={{ color: C.orange, fontWeight: '800', fontSize: '13px' }}>${plate.items.reduce((s, i) => s + i.precio * i.qty, 0).toFixed(2)}</span>
                  </div>
                  {plate.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.textMuted }}>
                      <span>{item.nombre}</span><span>×{item.qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginBottom: '14px' }}>
              <span style={{ color: C.textSecondary, fontWeight: '700', fontSize: '14px' }}>Total</span>
              <span style={{ color: C.orange, fontWeight: '900', fontSize: '18px' }}>${totalPrecio.toFixed(2)}</span>
            </div>
            {orderModalErr && (
              <div style={{ background: `${C.pink}10`, border: `1px solid ${C.pink}40`, borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', color: C.pink, fontSize: '13px', fontWeight: '600' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />{orderModalErr}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowOrderModal(false)} disabled={orderingNow}
                style={{ flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '12px', color: C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: orderingNow ? 'not-allowed' : 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleQuickOrder} disabled={orderingNow}
                style={{ flex: 2, background: orderingNow ? C.bgAccent : C.teal, border: `1.5px solid ${orderingNow ? C.border : C.teal}`, borderRadius: '10px', padding: '12px', color: orderingNow ? C.textMuted : '#fff', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: orderingNow ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: orderingNow ? 'none' : glow(C.teal, '55'), transition: 'all 0.2s' }}>
                {orderingNow ? <><Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Enviando...</> : <><CheckCircle size={15} /> Enviar a cocina</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast éxito */}
      {orderSuccess && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 9996, background: C.teal, color: '#fff', borderRadius: '12px', padding: '12px 22px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 8px 32px rgba(0,0,0,0.4), ${glow(C.teal, '55')}`, whiteSpace: 'nowrap' }}>
          <CheckCircle size={18} /> ¡Pedido enviado a cocina!
        </div>
      )}

      <PayConfirmModal isOpen={showPayModal} onConfirm={handleConfirmarPago} onCancel={handleCerrarPayModal} loading={payLoading} error={payError} />

      <EmojiRatingModal 
        isOpen={showEmojiRating} 
        iMesaId={iMesaId}
        onComplete={handleEmojiComplete} 
      />



      {animatingEnd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: C.orange, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOut 2s forwards' }}>
          <div style={{ animation: 'bounceUp 0.6s ease-in-out infinite alternate' }}>
            <ClipboardList size={100} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '900', marginTop: '24px', animation: 'scaleUp 0.8s ease-out', textAlign: 'center', padding: '0 20px' }}>Enviando tu cuenta al cajero...</h1>
        </div>
      )}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes scaleIn  { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp  { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MyOrder;