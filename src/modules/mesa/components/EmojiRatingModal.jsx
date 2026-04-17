import { useState } from 'react';
import { C, FONT, glow } from '../../../styles/designTokens';
import { X, Sparkles } from 'lucide-react';
import { commentsService } from '../../../services/comments';

const EMOJIS = [
  { emoji: '😍', label: 'Increíble', color: '#E91E63' },
  { emoji: '😊', label: 'Bien',      color: '#4CAF50' },
  { emoji: '😐', label: 'Regular',   color: '#FF9800' },
  { emoji: '😞', label: 'Mal',       color: '#9E9E9E' },
];

export function EmojiRatingModal({ isOpen, iMesaId, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [thanking, setThanking] = useState(false);
  const [hovIdx,   setHovIdx]   = useState(null);

  if (!isOpen) return null;

  const handleSelect = async (idx) => {
    setSelected(idx);
    setThanking(true);

    // Guardar en el Backend (MySQL)
    try {
      await commentsService.create({
        iMesaId,
        sEmoji: EMOJIS[idx].emoji,
        sCalificacion: EMOJIS[idx].label,
      });
    } catch (err) {
      console.error("Error al guardar calificación en BD:", err);
    }

    // Historial local (opcional/respaldo)
    try {
      const ratings = JSON.parse(localStorage.getItem('itaquito_ratings') || '[]');
      ratings.push({
        emoji: EMOJIS[idx].emoji,
        label: EMOJIS[idx].label,
        date: new Date().toISOString(),
      });
      localStorage.setItem('itaquito_ratings', JSON.stringify(ratings));
    } catch { /* silently fail */ }

    // Esperar un momento para mostrar agradecimiento y luego completar
    setTimeout(() => {
      setThanking(false);
      setSelected(null);
      onComplete();
    }, 2200); // Un poco más de tiempo para que se aprecie
  };

  const handleSkip = () => {
    setSelected(null);
    setThanking(false);
    onComplete();
  };

  return (
    <div
      onClick={thanking ? undefined : handleSkip}
      style={{
        position: 'fixed', inset: 0, zIndex: 10001, // Por encima de todo
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: FONT,
        animation: 'emojiModalFadeIn 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.bgCard,
          border: `1.5px solid ${C.border}`,
          borderRadius: '24px',
          padding: thanking ? '40px 32px' : '32px 28px',
          width: '100%', maxWidth: '380px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
          animation: 'emojiModalSlideUp 0.3s ease',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {thanking ? (
          /* ─── Thank You State ─── */
          <div style={{ animation: 'emojiThankPop 0.4s ease' }}>
            <div style={{
              fontSize: '64px', lineHeight: 1, marginBottom: '16px',
              animation: 'emojiBounce 0.5s ease',
            }}>
              {EMOJIS[selected]?.emoji || '🌮'}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginBottom: '8px',
            }}>
              <Sparkles size={18} color={C.yellow} />
              <h3 style={{
                margin: 0, fontSize: '20px', fontWeight: '800',
                color: C.textPrimary,
              }}>
                ¡Gracias por tu opinión!
              </h3>
              <Sparkles size={18} color={C.yellow} />
            </div>
            <p style={{
              margin: 0, color: C.textSecondary, fontSize: '14px',
              fontWeight: '500',
            }}>
              Tu feedback nos ayuda a mejorar 🌮
            </p>
          </div>
        ) : (
          /* ─── Rating State ─── */
          <>
            {/* Close */}
            <button
              onClick={handleSkip}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.textMuted, padding: '4px', display: 'flex',
                borderRadius: '6px', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = `${C.border}50`; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = 'none'; }}
            >
              <X size={18} />
            </button>

            {/* Taco icon */}
            <div style={{
              fontSize: '42px', lineHeight: 1, marginBottom: '16px',
              animation: 'emojiTacoWiggle 1.5s ease infinite',
            }}>
              🌮
            </div>

            <h3 style={{
              margin: '0 0 6px', fontSize: '19px', fontWeight: '800',
              color: C.textPrimary, letterSpacing: '-0.3px',
            }}>
              ¿Cómo estuvieron tus tacos?
            </h3>
            <p style={{
              margin: '0 0 24px', color: C.textSecondary,
              fontSize: '13px', fontWeight: '500',
            }}>
              Tu opinión nos importa mucho
            </p>

            {/* Emojis */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '12px', marginBottom: '20px',
            }}>
              {EMOJIS.map((item, idx) => {
                const isHov = hovIdx === idx;
                return (
                  <button
                    key={idx}
                    id={`emoji-rating-${idx}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setHovIdx(idx)}
                    onMouseLeave={() => setHovIdx(null)}
                    style={{
                      background: isHov ? `${item.color}15` : C.bg,
                      border: `2px solid ${isHov ? item.color : C.border}`,
                      borderRadius: '16px',
                      padding: '14px 10px 10px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s ease',
                      transform: isHov ? 'translateY(-6px) scale(1.08)' : 'translateY(0) scale(1)',
                      boxShadow: isHov
                        ? `0 8px 24px ${item.color}30`
                        : '0 2px 6px rgba(0,0,0,0.06)',
                      minWidth: '68px',
                    }}
                  >
                    <span style={{
                      fontSize: '32px', lineHeight: 1,
                      transition: 'transform 0.2s ease',
                      transform: isHov ? 'scale(1.15)' : 'scale(1)',
                    }}>
                      {item.emoji}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      color: isHov ? item.color : C.textMuted,
                      fontFamily: FONT,
                      transition: 'color 0.2s',
                    }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Skip */}
            <button
              onClick={handleSkip}
              style={{
                background: 'none', border: 'none',
                color: C.textMuted, fontSize: '12px',
                fontWeight: '600', cursor: 'pointer',
                fontFamily: FONT, padding: '4px 12px',
                borderRadius: '6px', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.textDecoration = 'none'; }}
            >
              Saltar
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes emojiModalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes emojiModalSlideUp {
          from { transform: translateY(40px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes emojiThankPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes emojiBounce {
          0%   { transform: scale(0.4) rotate(-10deg); }
          50%  { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes emojiTacoWiggle {
          0%, 100% { transform: rotate(0); }
          25%      { transform: rotate(-8deg); }
          75%      { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}

export default EmojiRatingModal;
