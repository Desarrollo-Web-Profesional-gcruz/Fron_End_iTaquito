import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { productsService } from '../../../services/products';
import { categoriesService } from '../../../services/categories';
import { tablesService } from '../../../services/tables';
import { ordersService } from '../../../services/orders';
import { C, FONT, glow } from '../../../styles/designTokens';
import { usePedirCuenta } from '../../../hooks/usePedirCuenta';
import { PayConfirmModal } from '../components/PayConfirmModal';
import { EmojiRatingModal } from '../components/EmojiRatingModal';
import {
  Search, SlidersHorizontal, ShoppingBag, UtensilsCrossed,
  Plus, Minus, Check, X, ChevronUp, ChevronDown, AlertCircle,
  LogOut, MapPin, Utensils, ClipboardList, Pencil, Loader,
  CheckCircle, Trash2, ChevronRight,
} from 'lucide-react';
import Breadcrumb from '../../../components/layout/Breadcrumb';

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
function NavBtn({ label, active, onClick, color, children }) {
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

/* ─── HEADER ─────────────────────────────────────────────────── */
function ClientHeader({ user, totalItems, onLogout, iMesaId, mesaNombre }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMesero = user?.rol === 'mesero';
  return (
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

        <button onClick={onLogout}
          style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}33`, borderRadius: '8px', padding: '6px 12px', color: C.pink, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.pink}22`; e.currentTarget.style.borderColor = C.pink; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${C.pink}12`; e.currentTarget.style.borderColor = `${C.pink}33`; }}>
          <LogOut size={13} /> Salir
        </button>
      </div>
    </header>
  );
}

/* ─── PRODUCT CARD ───────────────────────────────────────────── */
function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const [hov,   setHov]   = useState(false);
  const [qty,   setQty]   = useState(1);
  const disponible = product.bDisponible;

  const handleAdd = () => {
    onAdd(product, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov && disponible ? C.bgCardHov : C.bgCard, border: `1.5px solid ${hov && disponible ? C.pink : C.border}`, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transform: hov && disponible ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hov && disponible ? `0 12px 28px rgba(0,0,0,0.35), ${glow(C.pink, '18')}` : '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.22s ease', opacity: disponible ? 1 : 0.55 }}>
      <div style={{ width: '100%', aspectRatio: '16/9', background: `${C.pink}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {product.sImagenUrl
          ? <img src={product.sImagenUrl} alt={product.sNombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <UtensilsCrossed size={32} color={`${C.pink}55`} />}
        {product.categoria && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', borderRadius: '20px', padding: '3px 10px', color: C.textSecondary, fontSize: '11px', fontWeight: '700' }}>
            {product.categoria.sNombre}
          </div>
        )}
        {!disponible && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,13,11,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: C.bgAccent, border: `1px solid ${C.border}`, color: C.textMuted, borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '700' }}>No disponible</span>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ margin: 0, color: C.textPrimary, fontWeight: '800', fontSize: '15px', lineHeight: 1.3, fontFamily: FONT }}>{product.sNombre}</h3>
        {product.sDescripcion && (
          <p style={{ margin: 0, color: C.textMuted, fontSize: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.sDescripcion}</p>
        )}
        <div style={{ paddingTop: '10px', borderTop: `1px solid ${C.border}`, marginTop: 'auto' }}>
          <span style={{ color: C.yellow, fontWeight: '800', fontSize: '18px' }}>${parseFloat(product.dPrecio).toFixed(2)}</span>
        </div>
        {disponible ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: C.bgAccent, borderRadius: '8px', padding: '4px 6px', border: `1px solid ${C.border}`, flexShrink: 0 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: qty <= 1 ? 'transparent' : `${C.pink}20`, color: qty <= 1 ? C.textMuted : C.pink, cursor: qty <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.15s' }}>
                  <Minus size={12} />
                </button>
                <input
                  type="number" min={1} max={20} value={qty}
                  onChange={e => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  style={{ width: '30px', background: 'transparent', border: 'none', outline: 'none', color: C.textPrimary, fontFamily: FONT, fontWeight: '800', fontSize: '13px', textAlign: 'center', padding: 0 }}
                />
                <button onClick={() => setQty(q => Math.min(20, q + 1))}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: `${C.pink}22`, color: C.pink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.15s' }}>
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={handleAdd}
                style={{ background: added ? C.teal : C.pink, color: '#fff', border: 'none', borderRadius: '9px', padding: '8px 12px', fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s', minWidth: '80px', justifyContent: 'center' }}>
                {added ? <><Check size={12} /> ¡Listo!</> : <><Plus size={12} /> Agregar</>}
              </button>
            </div>
          ) : (
            <span style={{ color: C.textMuted, fontSize: '12px', fontWeight: '700' }}>No disponible</span>
          )}
      </div>
    </div>
  );
}

/* ─── CART FAB ───────────────────────────────────────────────── */
function CartFab({ totalItems, totalPrecio, activePlateLabel, onClick }) {
  if (totalItems === 0) return null;
  return (
    <button onClick={onClick}
      style={{ position: 'fixed', bottom: '24px', right: '24px', background: C.pink, color: '#fff', border: 'none', borderRadius: '14px', padding: '11px 18px', fontFamily: FONT, fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', boxShadow: `0 8px 24px rgba(0,0,0,0.4), ${glow(C.pink, '66')}`, zIndex: 150, transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShoppingBag size={15} />
        <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        <div style={{ width: '1px', height: '13px', background: 'rgba(255,255,255,0.3)' }} />
        <span>${totalPrecio.toFixed(2)}</span>
      </div>
      {activePlateLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8, fontSize: '10px', fontWeight: '700', letterSpacing: '0.2px' }}>
          <Utensils size={9} />
          <span>{activePlateLabel}</span>
        </div>
      )}
    </button>
  );
}

function PayFab({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ position: 'fixed', bottom: '24px', left: '24px', background: C.orange, color: '#fff', border: 'none', borderRadius: '14px', padding: '12px 20px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 8px 24px rgba(0,0,0,0.4), ${glow(C.orange, '66')}`, zIndex: 150, transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <ClipboardList size={18} />
      <span>Pedir Cuenta</span>
    </button>
  );
}

/* ─── PLATES SIDEBAR ─────────────────────────────────────────── */
const PLATE_COLORS = [C.pink, C.teal, C.orange, C.purple, C.yellow];

function PlatesSidebar({ plates, activePlateId, onSelect, onAdd, onRemove, onRename, onAdjustItem, onRemoveItem }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal,  setRenameVal]  = useState('');

  const startRename = (e, plate) => {
    e.stopPropagation();
    setRenamingId(plate.id);
    setRenameVal(plate.label);
  };
  const commitRename = (id) => {
    if (renameVal.trim()) onRename(id, renameVal.trim());
    setRenamingId(null);
  };

  const totalGlobal = plates.reduce((s, p) => s + p.items.reduce((si, i) => si + i.precio * i.qty, 0), 0);

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      position: 'sticky', top: '74px',
      alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }} className="hide-scroll">
      <div style={{
        background: C.bgCard,
        border: `1.5px solid ${C.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.pink, boxShadow: glow(C.pink, '55') }} />
          <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '13px' }}>Platos</span>
          <span style={{
            marginLeft: 'auto', background: `${C.pink}15`, border: `1px solid ${C.pink}33`,
            color: C.pink, borderRadius: '20px', padding: '1px 8px',
            fontSize: '10px', fontWeight: '800',
          }}>{plates.length}</span>
        </div>

        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {plates.map((plate, idx) => {
            const active   = plate.id === activePlateId;
            const color    = PLATE_COLORS[idx % PLATE_COLORS.length];
            const itemQty  = plate.items.reduce((s, i) => s + i.qty, 0);
            const subtotal = plate.items.reduce((s, i) => s + i.precio * i.qty, 0);

            return (
              <div
                key={plate.id}
                onClick={() => onSelect(plate.id)}
                style={{
                  borderRadius: '12px', padding: '10px 10px',
                  background: active ? `${color}10` : 'transparent',
                  border: `1.5px solid ${active ? color + '55' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                  boxShadow: active ? glow(color, '18') : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    background: active ? `${color}18` : `${C.border}50`,
                    border: `1.5px solid ${active ? color + '55' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.18s',
                  }}>
                    <Utensils size={15} color={active ? color : C.textMuted} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {renamingId === plate.id ? (
                      <input
                        autoFocus value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => commitRename(plate.id)}
                        onKeyDown={e => e.key === 'Enter' && commitRename(plate.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'transparent', border: 'none', outline: 'none', borderBottom: `1px solid ${color}`, color: color, fontFamily: FONT, fontWeight: '700', fontSize: '12px', width: '100%', padding: '1px 0' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: active ? color : C.textSecondary, fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '96px' }}>
                          {plate.label}
                        </span>
                        {itemQty > 0 && (
                          <span style={{ background: active ? color : C.textMuted, color: '#fff', borderRadius: '99px', padding: '0 5px', fontSize: '9px', fontWeight: '900', minWidth: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {itemQty}
                          </span>
                        )}
                      </div>
                    )}
                    {subtotal > 0 && (
                      <div style={{ color: C.textMuted, fontSize: '10px', marginTop: '1px', fontWeight: '600' }}>
                        ${subtotal.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                    {active && renamingId !== plate.id && (
                      <button onClick={e => startRename(e, plate)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${color}88`, padding: '2px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}18`; }}
                        onMouseLeave={e => { e.currentTarget.style.color = `${color}88`; e.currentTarget.style.background = 'none'; }}>
                        <Pencil size={10} />
                      </button>
                    )}
                    {plates.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); onRemove(plate.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '2px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.pink; e.currentTarget.style.background = `${C.pink}12`; }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = 'none'; }}>
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {active && plate.items.length > 0 && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                    {plate.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
                        <span style={{ flex: 1, color: C.textMuted, fontSize: '11px', lineHeight: '1.35', wordBreak: 'break-word' }}>
                          {item.nombre}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          <button onClick={e => { e.stopPropagation(); onAdjustItem(plate.id, item.id, -1); }}
                            style={{ width: '36px', height: '36px', borderRadius: '9px', border: `1.5px solid ${C.border}`, background: C.bg, color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.12s', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.pink; e.currentTarget.style.color = C.pink; e.currentTarget.style.background = `${C.pink}12`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = C.bg; }}>
                            <Minus size={13} />
                          </button>
                          <span style={{ color: C.textPrimary, fontSize: '14px', fontWeight: '900', minWidth: '22px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={e => { e.stopPropagation(); onAdjustItem(plate.id, item.id, 1); }}
                            style={{ width: '36px', height: '36px', borderRadius: '9px', border: `1.5px solid ${color}66`, background: `${color}18`, color: color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.12s', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
                            onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}>
                            <Plus size={13} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onRemoveItem(plate.id, item.id); }}
                            style={{ width: '36px', height: '36px', borderRadius: '9px', border: `1.5px solid transparent`, background: 'transparent', color: C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.12s', flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#C0392B'; e.currentTarget.style.background = '#C0392B15'; e.currentTarget.style.borderColor = '#C0392B44'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onAdd}
            style={{
              width: '100%', background: 'transparent',
              border: `1.5px dashed ${C.border}`,
              borderRadius: '12px', padding: '9px 12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              color: C.textMuted, fontFamily: FONT, fontWeight: '700', fontSize: '11px',
              transition: 'all 0.18s', marginTop: '2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; e.currentTarget.style.background = `${C.teal}08`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = 'transparent'; }}
          >
            <Plus size={12} /> Nuevo Plato
          </button>
        </div>

        {totalGlobal > 0 && (
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: C.textMuted, fontSize: '11px', fontWeight: '700' }}>Total carrito</span>
            <span style={{ color: C.orange, fontWeight: '800', fontSize: '14px' }}>${totalGlobal.toFixed(2)}</span>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MENU MESA
═══════════════════════════════════════════════════════════════ */
const MenuMesa = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // iMesaId: para rol 'mesa' viene del user, para rol 'mesero' viene del localStorage
  const isMesero = user?.rol === 'mesero';
  const iMesaId = user?.iMesaId || (isMesero ? Number(localStorage.getItem('meseroMesaId')) || null : null);
  const meseroMesaNombre = isMesero ? localStorage.getItem('meseroMesaNombre') : null;

  const {
    addItemQty, totalItems, totalPrecio,
    plates, activePlateId, activePlate,
    setActivePlate, addPlate, removePlate, renamePlate,
    adjustItemInPlate, removeItemFromPlate, clearAllPlates,
  } = useCart();

  const [showOrderModal,  setShowOrderModal]  = useState(false);
  const [orderingNow,     setOrderingNow]     = useState(false);
  const [orderSuccess,    setOrderSuccess]    = useState(false);
  const [orderError,      setOrderError]      = useState('');

  // ── NUEVO: modal de confirmación de logout ──
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut,      setLoggingOut]      = useState(false);

  // ── Emoji Rating ──
  const [showEmojiRating, setShowEmojiRating]  = useState(false);
  const [pendingAction,   setPendingAction]    = useState(null); // 'logout' | 'pay'

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [catId,       setCatId]       = useState('');
  const [soloDisp,    setSoloDisp]    = useState(false);
  const [orden,       setOrden]       = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // El mesero ya tiene la mesa ocupada (la ocupó desde /tables)
  const [mesaEstado, setMesaEstado] = useState(isMesero ? 'ocupada' : null);
  const [animatingStart, setAnimatingStart] = useState(false);
  const [animatingEnd,   setAnimatingEnd]   = useState(false);
  const [showPayModal,   setShowPayModal]   = useState(false);

  const { ejecutar: ejecutarPedirCuenta, loading: payLoading, error: payError, clearError: clearPayError } = usePedirCuenta({
    iMesaId,
    onEnPago: useCallback(() => {
      setTimeout(() => { setMesaEstado('en_pago'); setAnimatingEnd(false); }, 2000);
    }, []),
    onDisponible: useCallback(() => {
      setTimeout(() => { setMesaEstado('disponible'); setAnimatingEnd(false); }, 2000);
    }, []),
  });

  const handleAbrirPayModal  = () => { clearPayError(); setShowPayModal(true); };
  const handleCerrarPayModal = () => { if (!payLoading) setShowPayModal(false); };
  const handleConfirmarPago  = async () => {
    setAnimatingEnd(true);
    const ok = await ejecutarPedirCuenta();
    if (ok) {
      setShowPayModal(false);
      // Mostrar emoji rating tras pagar
      setPendingAction('pay');
      setShowEmojiRating(true);
    } else {
      setAnimatingEnd(false);
    }
  };

  // Si el mesero navega sin mesa seleccionada (ej: refresh), redirigir a /tables
  useEffect(() => {
    if (isMesero && !iMesaId) {
      navigate('/tables');
    }
  }, [isMesero, iMesaId, navigate]);

  // Polling para vigilar el estado de la mesa (Ej: Liberación del cajero)
  useEffect(() => {
    if (!iMesaId) return;
    const fetchMesa = async () => {
      try {
        const res = await tablesService.getById(iMesaId);
        if (res.success && res.data) {
          setMesaEstado(res.data.sEstado);
          // Si la mesa quedó disponible, limpiar tokens
          if (res.data.sEstado === 'disponible') {
            localStorage.removeItem('mesaSessionToken');
            if (isMesero) {
              localStorage.removeItem('meseroMesaId');
              localStorage.removeItem('meseroMesaNombre');
              // Redirigir al mesero de vuelta a /tables
              navigate('/tables');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching mesa:', err);
      }
    };
    fetchMesa();
    const interval = setInterval(fetchMesa, 4000);
    return () => clearInterval(interval);
  }, [iMesaId, isMesero, navigate]);

  const handleComenzar = async () => {
    try {
      setAnimatingStart(true);
      const newToken = crypto.randomUUID();
      localStorage.setItem('mesaSessionToken', newToken);
      await tablesService.changeStatus(iMesaId, 'ocupada');
      setTimeout(() => {
        setMesaEstado('ocupada');
        setAnimatingStart(false);
      }, 2000);
    } catch (e) {
      console.error(e);
      setAnimatingStart(false);
      alert('Error al iniciar la mesa.');
    }
  };

  // ── NUEVO: abre modal antes de cerrar sesión ──
  const handleLogoutRequest = () => setShowLogoutModal(true);

  // ── ejecuta el logout real tras confirmar ──
  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    // Mostrar emoji rating antes de hacer logout
    setPendingAction('logout');
    setShowEmojiRating(true);
  };

  // ── Ejecuta la acción pendiente tras el rating ──
  const handleEmojiComplete = async () => {
    setShowEmojiRating(false);
    if (pendingAction === 'logout') {
      setLoggingOut(true);
      try {
        if (iMesaId && mesaEstado === 'ocupada') {
          await tablesService.changeStatus(iMesaId, 'disponible');
          localStorage.removeItem('mesaSessionToken');
          if (isMesero) {
            localStorage.removeItem('meseroMesaId');
            localStorage.removeItem('meseroMesaNombre');
          }
        }
      } catch { /* silently fail */ }
      clearAllPlates();
      logout();
      setLoggingOut(false);
    }
    setPendingAction(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          productsService.getAll(),
          categoriesService.getAll(),
        ]);
        setProducts(prods.filter(p => p.bActivo));
        setCategories(cats);
      } catch {
        setError('No se pudo cargar el menú. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) list = list.filter(p => p.sNombre.toLowerCase().includes(search.toLowerCase()));
    if (catId) list = list.filter(p => String(p.iCategoriaId) === String(catId));
    list = list.filter(p => p.bDisponible);
    if (orden === 'asc')  list.sort((a, b) => parseFloat(a.dPrecio) - parseFloat(b.dPrecio));
    if (orden === 'desc') list.sort((a, b) => parseFloat(b.dPrecio) - parseFloat(a.dPrecio));
    return list;
  }, [products, search, catId, orden]);

  const handleAdd = (product, qty = 1) => {
    addItemQty({ id: product.id, nombre: product.sNombre, precio: parseFloat(product.dPrecio), imagen: product.sImagenUrl || null }, qty);
  };


  const handleQuickOrder = async () => {
    const nonEmpty = plates.filter(p => p.items.length > 0);
    if (!nonEmpty.length) return;
    if (!iMesaId) {
      setOrderError('No hay una mesa seleccionada. Regresa a /tables y ocupa una mesa.');
      return;
    }
    const token = localStorage.getItem('mesaSessionToken');
    setOrderingNow(true); setOrderError('');
    try {
      for (const plate of nonEmpty) {
        await ordersService.create({
          iMesaId,
          items: plate.items.map(i => ({ iProductoId: i.id, iCantidad: i.qty })),
          sTokenSesion: token,
          sNombrePlato: plate.label,
        });
      }
      clearAllPlates();
      setShowOrderModal(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 2500);
    } catch (e) {
      setOrderError(e.response?.data?.message || 'Error al enviar el pedido.');
    } finally { setOrderingNow(false); }
  };

  const clearFilters = () => { setSearch(''); setCatId(''); setOrden(''); };
  const hasFilters = search || catId || orden;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      {/* ─── TRANSICION END ─── */}
      {animatingEnd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: C.orange, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOut 2s forwards' }}>
          <div style={{ animation: 'bounceUp 0.6s ease-in-out infinite alternate' }}>
            <ClipboardList size={100} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '900', marginTop: '24px', animation: 'scaleUp 0.8s ease-out', textAlign: 'center', padding: '0 20px' }}>Enviando tu cuenta al cajero...</h1>
        </div>
      )}

      {/* ─── MODAL BIENVENIDA (BLOQUEO) — solo para rol 'mesa', no para mesero ─── */}
      {mesaEstado === 'disponible' && !animatingStart && !isMesero && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: C.bgCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: `${C.pink}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: glow(C.pink, '44') }}>
            <UtensilsCrossed size={40} color={C.pink} />
          </div>
          <h1 style={{ color: C.textPrimary, fontSize: '32px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            ¡Bienvenido a iTaquito!
          </h1>
          <p style={{ color: C.textSecondary, fontSize: '16px', maxWidth: '400px', lineHeight: 1.6, margin: '0 0 32px' }}>
            Toca en COMENZAR para realizar tu pedido.
          </p>
          <button onClick={handleComenzar} style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: '16px', padding: '16px 40px', fontSize: '18px', fontWeight: '800', fontFamily: FONT, cursor: 'pointer', boxShadow: glow(C.pink, '66'), transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Comenzar !
          </button>
        </div>
      )}

      {/* ─── TRANSICION START ─── */}
      {animatingStart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: C.pink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOut 2s forwards' }}>
          <div style={{ animation: 'bounceUp 0.6s ease-in-out infinite alternate' }}>
            <UtensilsCrossed size={100} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: '900', marginTop: '24px', animation: 'scaleUp 0.8s ease-out' }}>¡A comer!</h1>
        </div>
      )}

      {/* ─── MODAL EN ESPERA A PAGO (BLOQUEO) ─── */}
      {(mesaEstado === 'en_pago' || mesaEstado === 'reservada') && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: C.bgCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', border: `3px solid ${C.teal}`, borderTopColor: 'transparent', animation: 'spin 1.5s linear infinite', margin: '0 auto 24px', position: 'relative' }}>
             <Utensils size={32} color={C.teal} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'none' }} />
          </div>
          <h1 style={{ color: C.textPrimary, fontSize: '32px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
            En espera a pago
          </h1>
          <p style={{ color: C.textSecondary, fontSize: '18px', maxWidth: '440px', lineHeight: 1.6, margin: '0' }}>
            Por favor, dirígete a caja. Una vez procesado el pago, esta pantalla se liberará automáticamente.
          </p>
        </div>
      )}

      {/* ── NUEVO: modal de confirmación de cerrar sesión ── */}
      {showLogoutModal && (
        <div
          onClick={() => { if (!loggingOut) setShowLogoutModal(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: FONT }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.55)', animation: 'slideUp 0.22s ease' }}
          >
            {/* Icono */}
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${C.pink}15`, border: `1.5px solid ${C.pink}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: glow(C.pink, '22') }}>
              <LogOut size={26} color={C.pink} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: C.textPrimary, textAlign: 'center' }}>
              ¿Cerrar sesión?
            </h3>
            <p style={{ margin: '0 0 24px', color: C.textSecondary, fontSize: '13px', textAlign: 'center', lineHeight: 1.6 }}>
              {mesaEstado === 'ocupada'
                ? 'La mesa quedará disponible y se perderá el carrito actual.'
                : 'Se cerrará tu sesión y se perderá el carrito actual.'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                style={{ flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '11px', color: C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: loggingOut ? 'not-allowed' : 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { if (!loggingOut) { e.currentTarget.style.borderColor = C.textSecondary; e.currentTarget.style.color = C.textPrimary; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSecondary; }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={loggingOut}
                style={{ flex: 1, background: loggingOut ? C.bgAccent : C.pink, border: `1.5px solid ${loggingOut ? C.border : C.pink}`, borderRadius: '10px', padding: '11px', color: loggingOut ? C.textMuted : '#fff', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: loggingOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loggingOut ? 'none' : glow(C.pink, '44'), transition: 'all 0.2s' }}
              >
                {loggingOut
                  ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saliendo...</>
                  : <><LogOut size={14} /> Sí, salir</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── El header ahora llama a handleLogoutRequest en lugar de handleLogout ── */}
      <ClientHeader user={user} totalItems={totalItems} onLogout={handleLogoutRequest}
        iMesaId={iMesaId}
        mesaNombre={user?.mesa?.sNombre || meseroMesaNombre || (iMesaId ? `Mesa ${iMesaId}` : null)}
      />

      <PapelPicado />

      <div style={{ background: C.bg, padding: '28px 24px 24px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '10%', width: '260px', height: '260px', borderRadius: '50%', background: `${C.pink}08`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '220px', height: '220px', borderRadius: '50%', background: `${C.teal}08`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px,5vw,38px)', fontWeight: '800', color: C.pink, letterSpacing: '-0.5px' }}>Nuestro Menú</h1>
          <p style={{ margin: 0, color: C.textSecondary, fontSize: '14px' }}>
            {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <PapelPicado flip />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px 120px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <Breadcrumb />
          {mesaEstado === 'ocupada' && (
            <PlatesSidebar
              plates={plates}
              activePlateId={activePlateId}
              onSelect={setActivePlate}
              onAdd={addPlate}
              onRemove={removePlate}
              onRename={renamePlate}
              onAdjustItem={adjustItemInPlate}
              onRemoveItem={removeItemFromPlate}
            />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* ─── SEARCH + SORT BAR ─── */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <SlidersHorizontal size={15} color={C.textMuted} style={{ flexShrink: 0 }} />

              <div style={{ position: 'relative', flex: '1 1 200px', display: 'flex', alignItems: 'center' }}>
                <Search size={14} color={searchFocus ? C.pink : C.textMuted} style={{ position: 'absolute', left: '10px', pointerEvents: 'none', transition: 'color 0.18s' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
                  placeholder="Buscar producto..."
                  style={{ width: '100%', boxSizing: 'border-box', background: C.bg, border: `1.5px solid ${searchFocus ? C.pink : C.border}`, borderRadius: '9px', padding: '8px 32px 8px 30px', color: C.textPrimary, fontFamily: FONT, fontWeight: '600', fontSize: '13px', outline: 'none', transition: 'border-color 0.18s' }} />
                {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, display: 'flex', padding: '2px' }}><X size={13} /></button>}
              </div>

              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {[{ val: 'asc', Icon: ChevronUp, label: 'Menor precio' }, { val: 'desc', Icon: ChevronDown, label: 'Mayor precio' }].map(({ val, Icon, label }) => (
                  <button key={val} onClick={() => setOrden(o => o === val ? '' : val)} title={label}
                    style={{ background: orden === val ? `${C.teal}22` : 'transparent', border: `1.5px solid ${orden === val ? C.teal : C.border}`, borderRadius: '9px', padding: '7px 10px', color: orden === val ? C.teal : C.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT, fontWeight: '700', fontSize: '12px', transition: 'all 0.18s' }}>
                    <Icon size={13} /> Precio
                  </button>
                ))}
              </div>

              {hasFilters && (
                <button onClick={clearFilters}
                  style={{ background: `${C.pink}12`, border: `1.5px solid ${C.pink}44`, borderRadius: '9px', padding: '7px 12px', color: C.pink, fontFamily: FONT, fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.pink}22`}
                  onMouseLeave={e => e.currentTarget.style.background = `${C.pink}12`}>
                  <X size={12} /> Limpiar
                </button>
              )}
            </div>

            {/* ─── CATEGORY PILLS ─── */}
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '20px',
              overflowX: 'auto', paddingBottom: '4px',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }} className="hide-scroll">
              {/* Pill "Todos" */}
              {[{ id: '', label: '🔥 Todos' }, ...categories.map(cat => ({ id: String(cat.id), label: cat.sNombre }))].map((pill) => {
                const isActive = catId === pill.id;
                return (
                  <button
                    key={pill.id}
                    id={`category-pill-${pill.id || 'all'}`}
                    onClick={() => setCatId(pill.id)}
                    style={{
                      background: isActive ? C.pink : C.bgCard,
                      border: `1.5px solid ${isActive ? C.pink : C.border}`,
                      borderRadius: '24px',
                      padding: '8px 18px',
                      color: isActive ? '#fff' : C.textSecondary,
                      fontFamily: FONT,
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 4px 14px ${C.pink}44` : '0 1px 3px rgba(0,0,0,0.06)',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = C.pink;
                        e.currentTarget.style.color = C.pink;
                        e.currentTarget.style.background = `${C.pink}10`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.color = C.textSecondary;
                        e.currentTarget.style.background = C.bgCard;
                      }
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {error ? (
              <div style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}44`, borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '10px', color: C.pink, fontSize: '14px', fontWeight: '600' }}>
                <AlertCircle size={18} /> {error}
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{ display: 'inline-block', width: '44px', height: '44px', border: `3px solid ${C.border}`, borderTopColor: C.pink, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ marginTop: '16px', color: C.textMuted, fontSize: '14px' }}>Cargando menú...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${C.pink}12`, border: `1.5px solid ${C.pink}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <UtensilsCrossed size={28} color={C.pink} />
                </div>
                <h3 style={{ color: C.textPrimary, margin: '0 0 8px', fontWeight: '800' }}>Sin resultados</h3>
                <p style={{ color: C.textSecondary, fontSize: '14px', margin: '0 0 20px' }}>Prueba con otros filtros</p>
                <button onClick={clearFilters} style={{ background: C.pink, color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 22px', fontFamily: FONT, fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: glow(C.pink) }}>
                  Ver todo el menú
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={handleAdd} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      <CartFab totalItems={totalItems} totalPrecio={totalPrecio} activePlateLabel={activePlate?.label}
        onClick={() => { setOrderError(''); setShowOrderModal(true); }} />

      {(mesaEstado === 'ocupada' && !animatingEnd && !animatingStart) && (
        <PayFab onClick={handleAbrirPayModal} />
      )}

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
              {plates.filter(p => p.items.length > 0).map((plate, idx) => (
                <div key={plate.id} style={{ background: C.bg, borderRadius: '12px', padding: '10px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', color: PLATE_COLORS[idx % PLATE_COLORS.length] }}>{plate.label}</span>
                    <span style={{ color: C.orange, fontWeight: '800', fontSize: '13px' }}>${plate.items.reduce((s,i)=>s+i.precio*i.qty,0).toFixed(2)}</span>
                  </div>
                  {plate.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.textMuted }}>
                      <span>{item.nombre}</span><span>×{item.qty}</span>
                    </div>
                  ))}
                </div>
              ))}
              {plates.every(p => p.items.length === 0) && (
                <p style={{ color: C.textMuted, textAlign: 'center', fontWeight: '600', fontSize: '13px', margin: 0 }}>El carrito está vacío</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, marginBottom: '14px' }}>
              <span style={{ color: C.textSecondary, fontWeight: '700', fontSize: '14px' }}>Total</span>
              <span style={{ color: C.orange, fontWeight: '900', fontSize: '18px' }}>${totalPrecio.toFixed(2)}</span>
            </div>
            {orderError && (
              <div style={{ background: `${C.pink}10`, border: `1px solid ${C.pink}40`, borderRadius: '10px', padding: '10px 14px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', color: C.pink, fontSize: '13px', fontWeight: '600' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />{orderError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowOrderModal(false)} disabled={orderingNow}
                style={{ flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: '10px', padding: '12px', color: C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: orderingNow ? 'not-allowed' : 'pointer' }}>Cancelar</button>
              <button onClick={handleQuickOrder} disabled={orderingNow || plates.every(p=>p.items.length===0)}
                style={{ flex: 2, background: orderingNow ? C.bgAccent : C.teal, border: `1.5px solid ${orderingNow ? C.border : C.teal}`, borderRadius: '10px', padding: '12px', color: orderingNow ? C.textMuted : '#fff', fontFamily: FONT, fontWeight: '800', fontSize: '14px', cursor: orderingNow ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: orderingNow ? 'none' : glow(C.teal, '55'), transition: 'all 0.2s' }}>
                {orderingNow ? <><Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Enviando...</> : <><CheckCircle size={15} /> Enviar a cocina</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast éxito */}
      {orderSuccess && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 9996, background: C.teal, color: '#fff', borderRadius: '12px', padding: '12px 22px', fontFamily: FONT, fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 8px 32px rgba(0,0,0,0.4), ${glow(C.teal, '55')}`, animation: 'slideDown 0.28s ease', whiteSpace: 'nowrap' }}>
          <CheckCircle size={18} /> ¡Pedido enviado a cocina!
        </div>
      )}

      <PayConfirmModal
        isOpen={showPayModal}
        onConfirm={handleConfirmarPago}
        onCancel={handleCerrarPayModal}
        loading={payLoading}
        error={payError}
      />

      {/* ── Emoji Rating Modal ── */}
      <EmojiRatingModal
        isOpen={showEmojiRating}
        iMesaId={iMesaId}
        onComplete={handleEmojiComplete}
      />

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeInOut { 0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0} }
        @keyframes bounceUp  { from{transform:translateY(0)} to{transform:translateY(-30px)} }
        @keyframes scaleUp   { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes slideUp   { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideDown { from{transform:translate(-50%,-20px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MenuMesa;