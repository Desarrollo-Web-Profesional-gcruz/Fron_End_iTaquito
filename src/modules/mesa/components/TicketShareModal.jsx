import React, { useState } from 'react';
import { CheckCircle, X, Send, MessageCircle, Smartphone, Loader } from 'lucide-react';
import { ordersService } from '../../../services/orders';
import { C, FONT } from '../../../styles/designTokens';

/**
 * Modal que ofrece al cliente enviar su ticket visual por WhatsApp automáticamente.
 * Utiliza la API de UltraMsg en el backend para un envío silencioso.
 */
export const TicketShareModal = ({ isOpen, onClose, items, total, tableName }) => {
  // Inicializamos con '+52' para México
  const [phone, setPhone] = useState('+52');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    // Validar formato básico (ej: +52 seguido de 10 dígitos)
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    
    if (cleanPhone.length < 10) {
      setError('Por favor ingresa un número válido (ej: +52 1234567890)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ordersService.sendTicketWhatsApp({
        phone: cleanPhone,
        tableName,
        items,
        total
      });
      
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false); // Reset para la próxima vez
        setLoading(false);
      }, 3500);

    } catch (e) {
      console.error(e);
      setError('Hubo un error al enviar el WhatsApp automático. Verifica tu conexión.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20002,
      background: 'rgba(26, 22, 18, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: FONT
    }}>
      <div style={{
        background: C.bgCard, border: `1.5px solid ${C.border}`,
        borderRadius: '28px', width: '100%', maxWidth: '440px',
        overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.45)',
        animation: 'modalEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Decorative Header (WhatsApp Style) */}
        <div style={{ 
          background: `linear-gradient(135deg, ${C.pink}, ${C.pinkDim})`, 
          padding: '32px 24px', textAlign: 'center', position: 'relative' 
        }}>
          {/* Decorative Pattern Background */}
          <div style={{ 
            position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }} />
          
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.3)'
          }}>
            <MessageCircle size={32} color="#fff" />
          </div>
          
          <h2 style={{ color: '#fff', margin: 0, fontSize: '26px', fontWeight: '900', letterSpacing: '-0.8px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            ¡Ticket Digital! 🌮
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '6px 0 0', fontSize: '14px', fontWeight: '600' }}>
            Recíbelo al instante en tu WhatsApp
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '10px 0', animation: 'fadeIn 0.6s ease-out' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: `${C.teal}15`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', 
                boxShadow: `0 0 30px ${C.teal}20`,
                animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <CheckCircle size={44} color={C.teal} />
              </div>
              <h3 style={{ color: C.textPrimary, fontSize: '22px', fontWeight: '900', margin: '0 0 8px' }}>¡Redirigiendo!</h3>
              <p style={{ color: C.textSecondary, fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
                Hemos generado tu ticket. Envíalo en el chat que se acaba de abrir.
              </p>
            </div>
          ) : (
            <>
              {/* Receipt Aesthetic Preview */}
              <div style={{
                background: '#fff', borderRadius: '12px 12px 0 0', padding: '20px',
                border: '1px solid #E5E7EB', borderBottom: 'none',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
              }}>
                <div style={{ borderBottom: `1.5px dashed ${C.border}`, paddingBottom: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Resumen de Consumo
                  </span>
                </div>
                
                <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: C.textPrimary, fontWeight: '600' }}>
                        {item.nombre} <span style={{color: C.textMuted, fontSize: '12px', fontWeight: '500'}}>x{item.qty}</span>
                      </span>
                      <span style={{ color: C.textPrimary, fontWeight: '800' }}>${(item.precio * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `2px solid ${C.bgAccent}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: C.textSecondary }}>Total a Pagar</span>
                  <span style={{ fontWeight: '900', fontSize: '24px', color: C.orange }}>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Sawtooth bottom effect */}
              <div style={{ 
                height: '12px', width: '100%', marginBottom: '28px',
                backgroundImage: `linear-gradient(-45deg, transparent 6px, #fff 0), linear-gradient(45deg, transparent 6px, #fff 0)`,
                backgroundPosition: 'left bottom', backgroundRepeat: 'repeat-x', backgroundSize: '12px 12px',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.02))'
              }} />

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: C.textSecondary, fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
                  ¿A qué número lo enviamos?
                </label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={18} color={error ? C.orange : (isHovered ? C.pink : C.textMuted)} 
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', transition: 'all 0.3s' }} 
                  />
                  <input
                    type="tel"
                    value={phone}
                    onFocus={() => setIsHovered(true)}
                    onBlur={() => setIsHovered(false)}
                    onChange={e => {setPhone(e.target.value); if(error) setError('');}}
                    placeholder="+52 123 456 7890"
                    style={{
                      width: '100%', boxSizing: 'border-box', background: C.bg,
                      border: `1.5px solid ${error ? C.orange : C.border}`, borderRadius: '16px',
                      padding: '16px 16px 16px 48px', color: C.textPrimary,
                      fontFamily: FONT, fontSize: '15px', fontWeight: '600',
                      outline: 'none', transition: 'all 0.3s',
                      boxShadow: isHovered ? (error ? `0 0 0 4px ${C.orange}15` : `0 0 0 4px ${C.pink}15`) : 'none'
                    }}
                  />
                </div>
                {error && (
                  <div style={{ color: C.orange, fontSize: '12px', marginTop: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> {error}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={onClose} 
                  style={{ 
                    flex: 1, height: '54px', borderRadius: '16px', background: 'transparent',
                    border: `1.5px solid ${C.border}`, color: C.textSecondary, fontWeight: '700',
                    cursor: 'pointer', fontFamily: FONT
                  }}
                >
                  Cerrar
                </button>
                <button 
                  onClick={handleShare} 
                  disabled={loading}
                  style={{ 
                    flex: 2, height: '54px', borderRadius: '16px', 
                    background: loading ? C.bgAccent : C.pink,
                    border: 'none', color: loading ? C.textMuted : '#fff', 
                    fontWeight: '800', fontSize: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontFamily: FONT, transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : `0 4px 12px ${C.pink}33`
                  }}
                  onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <><Loader size={18} style={{ animation: 'spin 1.5s linear infinite' }} /> Enviando...</>
                  ) : (
                    <><Send size={18} /> Enviar Ticket</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalEntrance { 
          from { opacity: 0; transform: translateY(20px) scale(0.96); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.5); } 
          to { opacity: 1; transform: scale(1); } 
        }
      `}</style>
    </div>
  );
};
