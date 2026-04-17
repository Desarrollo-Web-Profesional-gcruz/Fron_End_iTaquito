import React, { useState } from 'react';
import { Mail, CheckCircle, X, Loader, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { C, FONT, glow } from '../../../styles/designTokens';
import { ordersService } from '../../../services/orders';

/**
 * Modal que ofrece al cliente enviar su ticket visual por correo electrónico.
 */
export const EmailTicketModal = ({ isOpen, onClose, items, total, tableName, sessionToken }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setLoadingSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un correo válido.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await ordersService.sendTicketEmail({
        email,
        tableName,
        items,
        total,
        sessionToken
      });
      setLoadingSent(true);
      // Tras 2 segundos de éxito, cerrar modal
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e) {
      setError('No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20002,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: FONT
    }}>
      <div style={{
        background: C.bgCard, border: `1.5px solid ${C.border}`,
        borderRadius: '24px', width: '100%', maxWidth: '420px',
        overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        animation: 'scaleUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header Visual Style */}
        <div style={{ background: C.pink, padding: '24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(0,0,0,0.1)' }} />
          <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>¡Ticket iTaquito! 🌮</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: '13px', fontWeight: '600' }}>Tu cuenta está lista</p>
        </div>

        <div style={{ padding: '24px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.5s' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${C.teal}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: glow(C.teal, '44') }}>
                <CheckCircle size={32} color={C.teal} />
              </div>
              <h3 style={{ color: C.textPrimary, fontSize: '20px', fontWeight: '800', margin: '0 0 8px' }}>¡Enviado con éxito!</h3>
              <p style={{ color: C.textSecondary, fontSize: '14px', margin: 0 }}>Revisa tu bandeja de entrada en unos momentos.</p>
            </div>
          ) : (
            <>
              {/* Ticket Preview Card */}
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '16px',
                border: '1px solid #E5E7EB', marginBottom: '24px',
                position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ borderBottom: '1px dashed #D1D5DB', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: C.teal, textTransform: 'uppercase' }}>Resumen de Consumo</span>
                </div>
                
                <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: C.textPrimary, fontWeight: '600' }}>{item.nombre} <small style={{color: C.textMuted}}>x{item.qty}</small></span>
                      <span style={{ color: C.textPrimary, fontWeight: '700' }}>${(item.precio * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid #F3F4F6', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '14px', color: C.textSecondary }}>Total a Pagar</span>
                  <span style={{ fontWeight: '900', fontSize: '20px', color: C.orange }}>${total.toFixed(2)}</span>
                </div>
                
                {/* Decorative cut */}
                <div style={{ position: 'absolute', bottom: '-6px', left: '10%', right: '10%', height: '12px', background: C.bgCard, borderRadius: '100%', boxShadow: '0 -2px 4px rgba(0,0,0,0.03)' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: C.textSecondary, fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>¿A qué correo lo enviamos?</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={error ? C.pink : C.textMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    style={{
                      width: '100%', boxSizing: 'border-box', background: C.bg,
                      border: `1.5px solid ${error ? C.pink : C.border}`, borderRadius: '12px',
                      padding: '12px 12px 12px 38px', color: C.textPrimary,
                      fontFamily: FONT, fontSize: '14px', fontWeight: '600',
                      outline: 'none', transition: 'all 0.2s'
                    }}
                  />
                </div>
                {error && <p style={{ color: C.pink, fontSize: '12px', margin: '6px 0 0', fontWeight: '600' }}>{error}</p>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    flex: 1, background: 'transparent', border: `1.5px solid ${C.border}`,
                    borderRadius: '12px', padding: '14px', color: C.textSecondary,
                    fontFamily: FONT, fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  No, gracias
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  style={{
                    flex: 2, background: C.teal, border: 'none',
                    borderRadius: '12px', padding: '14px', color: '#fff',
                    fontFamily: FONT, fontWeight: '800', fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: glow(C.teal, '44'), transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? <Loader size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> : <><ArrowRight size={18} /> Enviar Ticket</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};
