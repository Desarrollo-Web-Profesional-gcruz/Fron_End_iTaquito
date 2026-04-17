import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ordersService } from '../../../services/orders';
import { productsService } from '../../../services/products';
import { C, FONT, glow } from '../../../styles/designTokens';
import { 
  ChefHat, 
  RefreshCw, 
  Clock, 
  CheckCircle,
  Flame,
  Check,
  Utensils
} from 'lucide-react';

/* ─── ESTADOS Y COLORES ─── */
const ESTADO = {
  pendiente:      { label: 'En fila',          color: C.yellow, Icon: Clock },
  en_preparacion: { label: 'En preparación',   color: C.orange, Icon: Flame },
};

/* ─── ORDER CARD PARA TAQUERO ─── */
function TaqueroOrderCard({ order, onChangeStatus, onRequestReady, catMap = {} }) {
  const estado = ESTADO[order.sEstado] || ESTADO.pendiente;
  const isPreparando = order.sEstado === 'en_preparacion';

  // Agrupar items por categoría
  const groupedItems = (order.items || []).reduce((acc, item) => {
    const catName = catMap[item.iProductoId] || 'Otros';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <div style={{ 
      background: C.bgCard, 
      border: `1.5px solid ${isPreparando ? C.orange : C.border}`, 
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: isPreparando ? glow(C.orange, '15') : 'none',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ height: '4px', background: estado.color }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ color: C.textPrimary, fontWeight: '800', fontSize: '18px' }}>Pedido #{order.id}</div>
            <div style={{ color: C.textMuted, fontSize: '13px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {order.iMesaId && (
              <div style={{ color: C.teal, fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>
                Mesa {order.iMesaId}
              </div>
            )}
          </div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px', 
            background: `${estado.color}18`, 
            border: `1px solid ${estado.color}44`, 
            color: estado.color, 
            borderRadius: '20px', 
            padding: '4px 12px', 
            fontSize: '12px', 
            fontWeight: '700' 
          }}>
            <estado.Icon size={14} /> {estado.label}
          </div>
        </div>

        {/* Lista de productos agrupados */}
        <div style={{ 
          background: C.bgAccent, 
          borderRadius: '12px', 
          padding: '12px', 
          marginBottom: '16px',
          flex: 1
        }}>
          {Object.entries(groupedItems).map(([catName, items]) => (
            <div key={catName} style={{ marginBottom: '12px' }}>
              <h4 style={{ color: C.pink, margin: '0 0 8px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${C.border}`, paddingBottom: '4px' }}>
                {catName}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      background: C.teal, 
                      color: '#fff', 
                      fontWeight: '800', 
                      fontSize: '13px', 
                      borderRadius: '6px', 
                      padding: '2px 6px',
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {item.iCantidad}
                    </div>
                    <div style={{ color: C.textPrimary, fontSize: '14px', fontWeight: '600', lineHeight: 1.3 }}>
                      {item.producto?.sNombre || `Prod #${item.iProductoId}`}
                      {item.sNotas && (
                        <div style={{ color: C.textMuted, fontSize: '12px', fontWeight: 'normal', fontStyle: 'italic', marginTop: '2px' }}>
                          Petición: {item.sNotas}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {order.sNotas && (
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: `1px dashed ${C.borderBright}`,
              color: C.yellow,
              fontSize: '13px',
              fontStyle: 'italic'
            }}>
              <span style={{ fontWeight: '700' }}>Nota de la orden:</span> {order.sNotas}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          {!isPreparando ? (
            <button 
              onClick={() => onChangeStatus(order.id, 'en_preparacion')}
              style={{ 
                flex: 1,
                background: C.orange, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '12px', 
                fontFamily: FONT, 
                fontWeight: '800', 
                fontSize: '14px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px', 
                boxShadow: glow(C.orange),
                transition: 'all 0.2s'
              }}
            >
              <Flame size={16} /> Preparar orden
            </button>
          ) : (
            <button 
              onClick={() => onRequestReady(order.id)}
              style={{ 
                flex: 1,
                background: C.teal, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '12px', 
                fontFamily: FONT, 
                fontWeight: '800', 
                fontSize: '14px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px', 
                boxShadow: glow(C.teal),
                transition: 'all 0.2s'
              }}
            >
              <Check size={18} /> ¡Orden Lista!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PÁGINA PRINCIPAL ─── */
const TaqueroPanel = () => {
  const [orders, setOrders] = useState([]);
  const [catMap, setCatMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });

  const loadActiveOrders = useCallback(async () => {
    try {
      // Cargar productos para mapear categorías
      if (Object.keys(catMap).length === 0) {
        const prods = await productsService.getAll().catch(() => []);
        const newCatMap = {};
        prods.forEach(p => {
          newCatMap[p.id] = p.categoria?.sNombre || 'Otros';
        });
        setCatMap(newCatMap);
      }

      const data = await ordersService.getAll();
      const allOrders = data.data || data || [];
      // Filtrar solo las ordenes activas
      const active = allOrders.filter(o => 
        o.sEstado === 'pendiente' || o.sEstado === 'en_preparacion'
      );
      // Opcional: ordenar primero las más viejas (FIFO)
      active.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setOrders(active);
      setError(null);
    } catch (err) {
      console.error("Error cargando ordenes de cocina:", err);
      setError("No se pudieron cargar los pedidos de la cocina.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActiveOrders();
    // Auto-refresh cada 15 segundos
    const interval = setInterval(loadActiveOrders, 5000);
    return () => clearInterval(interval);
  }, [loadActiveOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadActiveOrders();
  };

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await ordersService.changeStatus(orderId, newStatus);
      // Esperar brevemente para animación visual si se desea y luego recargar
      loadActiveOrders();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al actualizar el estado de la orden");
    }
  };

  const pendingCount = orders.filter(o => o.sEstado === 'pendiente').length;
  const prepCount = orders.filter(o => o.sEstado === 'en_preparacion').length;

  const groupedOrders = orders.reduce((acc, order) => {
    const mId = order.iMesaId || 'null';
    if (!acc[mId]) acc[mId] = [];
    acc[mId].push(order);
    return acc;
  }, {});

  const handleRequestReady = (orderId) => {
    setConfirmModal({ isOpen: true, orderId });
  };

  const handleConfirmReady = () => {
    if (confirmModal.orderId) {
      handleChangeStatus(confirmModal.orderId, 'listo');
    }
    setConfirmModal({ isOpen: false, orderId: null });
  };

  const handleCancelReady = () => {
    setConfirmModal({ isOpen: false, orderId: null });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT }}>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          flexWrap: 'wrap', gap: '16px', marginBottom: '32px',
          background: C.bgCard, padding: '24px', borderRadius: '20px', border: `1.5px solid ${C.border}`
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                background: `${C.orange}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <ChefHat size={18} color={C.orange} />
              </div>
              <span style={{ color: C.orange, fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Panel de Cocina
              </span>
            </div>
            <h1 style={{ margin: 0, color: C.textPrimary, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900' }}>
              Comandas Activas
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: `${C.yellow}15`, border: `1px solid ${C.yellow}44`, borderRadius: '10px', padding: '10px 16px' }}>
                <div style={{ color: C.textMuted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>En fila</div>
                <div style={{ color: C.yellow, fontSize: '20px', fontWeight: '900' }}>{pendingCount}</div>
              </div>
              <div style={{ background: `${C.orange}15`, border: `1px solid ${C.orange}44`, borderRadius: '10px', padding: '10px 16px' }}>
                <div style={{ color: C.textMuted, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Preparando</div>
                <div style={{ color: C.orange, fontSize: '20px', fontWeight: '900' }}>{prepCount}</div>
              </div>
            </div>

            <button 
              onClick={handleRefresh}
              style={{
                height: '48px',
                background: C.bgAccent, border: `1.5px solid ${C.borderBright}`, borderRadius: '12px',
                padding: '0 20px', color: C.textSecondary, fontFamily: FONT, fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.color = C.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderBright; e.currentTarget.style.color = C.textSecondary; }}
            >
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> 
              Actualizar
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ 
              display: 'inline-block', width: '48px', height: '48px', 
              border: `4px solid ${C.border}`, borderTopColor: C.orange, borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite' 
            }} />
            <p style={{ marginTop: '16px', color: C.textMuted, fontWeight: '600' }}>Cargando comandas de cocina...</p>
          </div>
        ) : error ? (
          <div style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}44`, borderRadius: '16px', padding: '24px', color: C.pink, textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: C.bgCard, borderRadius: '24px', border: `1.5px dashed ${C.border}` }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', 
              background: `${C.teal}15`, border: `2px solid ${C.teal}33`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 24px', boxShadow: glow(C.teal, '22') 
            }}>
              <CheckCircle size={40} color={C.teal} />
            </div>
            <h2 style={{ color: C.textPrimary, margin: '0 0 12px', fontWeight: '900', fontSize: '24px' }}>
              ¡La cocina está libre!
            </h2>
            <p style={{ color: C.textSecondary, margin: 0, fontSize: '16px' }}>
              No hay pedidos activos ni en preparación en este momento.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.entries(groupedOrders).map(([mesaId, mesaOrders]) => (
              <div key={mesaId} style={{ background: C.bgCard, borderRadius: '24px', border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
                {/* Cabecera de Mesa */}
                <div style={{ padding: '16px 24px', background: `${C.teal}10`, borderBottom: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '4px', height: '24px', background: C.teal, borderRadius: '2px', boxShadow: glow(C.teal) }} />
                  <h2 style={{ margin: 0, color: C.teal, fontSize: '20px', fontWeight: '900' }}>
                    {mesaId === 'null' ? 'Sin Mesa / Llevando' : `Mesa ${mesaId}`}
                  </h2>
                  <span style={{ background: C.bgAccent, border: `1px solid ${C.border}`, color: C.textSecondary, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', marginLeft: 'auto' }}>
                    {mesaOrders.length} orden(es)
                  </span>
                </div>
                {/* Grid de ordenes para esa mesa */}
                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {mesaOrders.map(o => (
                    <TaqueroOrderCard 
                      key={o.id} 
                      order={o}
                      catMap={catMap}
                      onChangeStatus={handleChangeStatus} 
                      onRequestReady={handleRequestReady}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={handleCancelReady} />
          
          <div style={{ 
            position: 'relative', background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '24px', 
            width: '100%', maxWidth: '420px', padding: '32px', boxShadow: `0 20px 40px rgba(0,0,0,0.3), ${glow(C.teal, '33')}`,
            textAlign: 'center', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ 
              width: '72px', height: '72px', borderRadius: '50%', background: `${C.teal}15`, border: `2px solid ${C.teal}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: glow(C.teal)
            }}>
              <CheckCircle size={36} color={C.teal} />
            </div>
            
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '900', color: C.textPrimary }}>
              ¿Terminaste la orden?
            </h2>
            <p style={{ margin: '0 0 28px', color: C.textSecondary, fontSize: '15px', lineHeight: 1.5 }}>
              Estás a punto de marcar el <strong style={{ color: C.teal }}>Pedido #{confirmModal.orderId}</strong> como finalizado y pasará a entrega.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleCancelReady}
                style={{ flex: 1, padding: '14px', background: C.bgAccent, border: 'none', borderRadius: '12px', color: C.textSecondary, fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.borderBright}
                onMouseLeave={e => e.currentTarget.style.background = C.bgAccent}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmReady}
                style={{ flex: 1, padding: '14px', background: C.teal, border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: glow(C.teal) }}
              >
                <Check size={18} /> Sí, está lista
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default TaqueroPanel;
