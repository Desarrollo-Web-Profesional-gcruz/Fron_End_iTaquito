import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { musicService } from '../../../services/music';
import { tablesService } from '../../../services/tables';
import { C, FONT, glow } from '../../../styles/designTokens';
import {
  LogOut, MapPin, Utensils, ClipboardList, Pencil, Loader, BellRing,
  CheckCircle, Trash2, Music, UtensilsCrossed, ShoppingBag,
  Search, Disc3, ListMusic, Plus, Check, X, Radio, AlertCircle
} from 'lucide-react';

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

/* ─── HEADER ─────────────────────────────────────────────────── */
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
      await tablesService.llamarMesero(iMesaId, 'Rockola');
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

/* ─── CRÉDITOS BADGE ─────────────────────────────────────────── */
function CreditosBadge({ usados, maximos }) {
  const restantes = maximos - usados;
  const pct = (usados / maximos) * 100;
  const color = restantes === 0 ? C.pink : restantes === 1 ? C.orange : C.teal;

  return (
    <div style={{
      background: C.bgCard, border: `1.5px solid ${color}44`, borderRadius: '16px',
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
        background: `${color}15`, border: `2px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Disc3 size={22} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>
            {restantes > 0 ? `${restantes} canción${restantes !== 1 ? 'es' : ''} disponible${restantes !== 1 ? 's' : ''}` : '¡Sin canciones disponibles!'}
          </span>
          <span style={{ color, fontWeight: '700', fontSize: '13px' }}>{usados}/{maximos}</span>
        </div>
        <div style={{ height: '6px', background: `${color}18`, borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── TRACK CARD ─────────────────────────────────────────────── */
function TrackCard({ track, onRequest, disabled, alreadyRequested, isInQueue }) {
  const [hov, setHov] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    if (disabled || alreadyRequested || isInQueue) return;
    const ok = await onRequest(track);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const cantRequest = disabled || alreadyRequested || isInQueue;
  let btnLabel = 'Pedir';
  let btnColor = C.purple;
  if (added) { btnLabel = '¡Agregada!'; btnColor = C.teal; }
  else if (alreadyRequested) { btnLabel = 'Ya pedida'; btnColor = C.textMuted; }
  else if (isInQueue) { btnLabel = 'En cola'; btnColor = C.orange; }
  else if (disabled) { btnLabel = 'Sin créditos'; btnColor = C.textMuted; }

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.bgCardHov : C.bgCard,
        border: `1.5px solid ${hov && !cantRequest ? C.purple : C.border}`,
        borderRadius: '14px', padding: '12px',
        display: 'flex', alignItems: 'center', gap: '12px',
        transition: 'all 0.2s', cursor: cantRequest ? 'default' : 'pointer',
        opacity: cantRequest && !alreadyRequested && !isInQueue ? 0.6 : 1,
      }}
    >
      {/* Album art */}
      <div style={{
        width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0,
        overflow: 'hidden', background: `${C.purple}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {track.imagenUrl
          ? <img src={track.imagenUrl} alt={track.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Music size={22} color={`${C.purple}55`} />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: C.textPrimary, fontWeight: '700', fontSize: '14px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.nombre}
        </div>
        <div style={{
          color: C.textMuted, fontSize: '12px', marginTop: '2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.artista}
        </div>
        {track.album && (
          <div style={{
            color: C.textMuted, fontSize: '11px', marginTop: '1px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.7,
          }}>
            {track.album}
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={handleClick}
        disabled={cantRequest && !added}
        style={{
          background: added ? C.teal : cantRequest ? 'transparent' : `${btnColor}15`,
          border: `1.5px solid ${added ? C.teal : cantRequest ? C.border : `${btnColor}55`}`,
          borderRadius: '10px', padding: '8px 14px',
          color: added ? '#fff' : btnColor,
          fontFamily: FONT, fontWeight: '700', fontSize: '12px',
          cursor: cantRequest && !added ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '5px',
          transition: 'all 0.2s', flexShrink: 0, minWidth: '100px', justifyContent: 'center',
        }}
      >
        {added ? <Check size={13} /> : alreadyRequested ? <Check size={13} /> : isInQueue ? <ListMusic size={13} /> : <Plus size={13} />}
        {btnLabel}
      </button>
    </div>
  );
}

/* ─── QUEUE ITEM ─────────────────────────────────────────────── */
function QueueItem({ song, index }) {
  const isPlaying = song.sEstado === 'reproduciendo';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
      background: isPlaying ? `${C.purple}10` : 'transparent',
      borderBottom: `1px solid ${C.border}`,
      animation: isPlaying ? 'pulse 2s infinite' : 'none',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
        background: isPlaying ? `${C.purple}22` : `${C.border}50`,
        border: `1px solid ${isPlaying ? C.purple + '55' : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isPlaying ? C.purple : C.textMuted, fontWeight: '800', fontSize: '11px',
      }}>
        {isPlaying ? <Radio size={13} /> : index + 1}
      </div>
      {song.sImagenUrl && (
        <img src={song.sImagenUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: isPlaying ? C.purple : C.textPrimary, fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.sNombre}
        </div>
        <div style={{ color: C.textMuted, fontSize: '11px' }}>{song.sArtista}</div>
      </div>
      {song.mesa && (
        <span style={{ fontSize: '10px', color: C.teal, fontWeight: '700', background: `${C.teal}12`, borderRadius: '8px', padding: '2px 8px', flexShrink: 0 }}>
          {song.mesa.sNombre}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROCKOLA PAGE
═══════════════════════════════════════════════════════════════ */
const Rockola = () => {
  const { user, logout } = useAuth();
  const iMesaId = user?.iMesaId || null;
  const mesaNombre = user?.mesa?.sNombre || (iMesaId ? `Mesa ${iMesaId}` : null);

  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [queue, setQueue] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [creditos, setCreditos] = useState({ usados: 0, restantes: 3, maximos: 3 });
  const [loading, setLoading] = useState(false);
  const [loadingRec, setLoadingRec] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const debounceRef = useRef(null);

  // Cargar recomendaciones, cola y mis solicitudes al inicio
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [recRes, queueRes, myRes] = await Promise.all([
          musicService.getRecommendations(),
          musicService.getQueue(),
          musicService.getMyRequests(),
        ]);
        setRecommendations(recRes.data || []);
        setQueue(queueRes.data || []);
        setMyRequests(myRes.data || []);
        setCreditos({
          usados: myRes.creditosUsados ?? 0,
          restantes: myRes.creditosRestantes ?? 3,
          maximos: myRes.creditosMaximos ?? 3,
        });
      } catch { /* silently fail */ }
      finally { setLoadingRec(false); }
    };
    loadInitial();
  }, []);

  // Polling para cola y créditos cada 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [queueRes, myRes] = await Promise.all([
          musicService.getQueue(),
          musicService.getMyRequests(),
        ]);
        setQueue(queueRes.data || []);
        setMyRequests(myRes.data || []);
        setCreditos({
          usados: myRes.creditosUsados ?? 0,
          restantes: myRes.creditosRestantes ?? 3,
          maximos: myRes.creditosMaximos ?? 3,
        });
      } catch { /* ignore */ }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim() || search.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await musicService.searchTracks(search.trim());
        setResults(res.data || []);
      } catch {
        setError('Error al buscar canciones.');
      } finally { setLoading(false); }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const handleRequest = useCallback(async (track) => {
    setError('');
    try {
      const res = await musicService.requestSong({
        spotifyTrackId: track.spotifyTrackId,
        nombre: track.nombre,
        artista: track.artista,
        album: track.album,
        imagenUrl: track.imagenUrl,
        previewUrl: track.previewUrl,
        duracionMs: track.duracionMs,
      });
      // Refresh
      setCreditos({
        usados: res.creditosUsados,
        restantes: res.creditosRestantes,
        maximos: res.creditosMaximos,
      });
      const [queueRes, myRes] = await Promise.all([
        musicService.getQueue(),
        musicService.getMyRequests(),
      ]);
      setQueue(queueRes.data || []);
      setMyRequests(myRes.data || []);
      setSuccessMsg(`🎵 "${track.nombre}" agregada a la cola`);
      setTimeout(() => setSuccessMsg(''), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al solicitar la canción.');
      return false;
    }
  }, []);
  const confirmCancel = useCallback(async () => {
    if (!cancelModal) return;
    setError('');
    try {
      const res = await musicService.cancelMySong(cancelModal.id);
      setCreditos({
        usados: res.creditosUsados,
        restantes: res.creditosRestantes,
        maximos: res.creditosMaximos,
      });
      const [queueRes, myRes] = await Promise.all([
        musicService.getQueue(),
        musicService.getMyRequests(),
      ]);
      setQueue(queueRes.data || []);
      setMyRequests(myRes.data || []);
      setSuccessMsg('🎵 Canción cancelada — crédito recuperado');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cancelar la canción.');
    }
    setCancelModal(null);
  }, [cancelModal]);

  const myTrackIds = myRequests.filter(r => r.sEstado !== 'descartada' && r.sEstado !== 'cancelada').map(r => r.sSpotifyTrackId);
  const myActiveSongs = myRequests.filter(r => r.sEstado === 'en_cola' || r.sEstado === 'reproduciendo');
  const queueTrackIds = queue.map(s => s.sSpotifyTrackId);
  const displayTracks = search.trim().length >= 2 ? results : recommendations;
  const noCredits = creditos.restantes <= 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.textPrimary }}>
      <ClientHeader onLogout={logout} />

      <PapelPicado />

      {/* Hero */}
      <div style={{ background: C.bg, padding: '28px 24px 24px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '10%', width: '260px', height: '260px', borderRadius: '50%', background: `${C.purple}08`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '220px', height: '220px', borderRadius: '50%', background: `${C.teal}08`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${C.purple}15`, border: `1.5px solid ${C.purple}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glow(C.purple, '33') }}>
              <Music size={24} color={C.purple} />
            </div>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(24px,5vw,38px)', fontWeight: '800', color: C.purple, letterSpacing: '-0.5px' }}>
            Rockola Digital
          </h1>
          <p style={{ margin: 0, color: C.textSecondary, fontSize: '14px' }}>
            ¡Pide tu canción favorita! · Máximo 3 por estancia
          </p>
        </div>
      </div>

      <PapelPicado flip />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 24px 100px' }}>

        {/* Créditos */}
        <div style={{ marginBottom: '20px' }}>
          <CreditosBadge usados={creditos.usados} maximos={creditos.maximos} />
        </div>

        {/* Search bar */}
        <div style={{
          background: C.bgCard, border: `1.5px solid ${searchFocus ? C.purple : C.border}`,
          borderRadius: '14px', padding: '4px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', transition: 'border-color 0.18s',
        }}>
          <Search size={16} color={searchFocus ? C.purple : C.textMuted} style={{ marginLeft: '12px', flexShrink: 0, transition: 'color 0.18s' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Busca una canción, artista o álbum..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '12px', color: C.textPrimary, fontFamily: FONT, fontWeight: '600',
              fontSize: '14px',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '8px 12px', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div style={{ background: `${C.pink}12`, border: `1px solid ${C.pink}44`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: C.pink, fontSize: '13px', fontWeight: '600' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}44`, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: C.teal, fontSize: '13px', fontWeight: '700', animation: 'slideIn 0.3s ease' }}>
            <Check size={15} /> {successMsg}
          </div>
        )}

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

          {/* Left — Search results or recommendations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.purple }} />
              <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '14px' }}>
                {search.trim().length >= 2 ? `Resultados para "${search}"` : 'Recomendaciones'}
              </span>
              {loading && <Loader size={14} color={C.purple} style={{ animation: 'spin 0.8s linear infinite' }} />}
            </div>

            {loadingRec && !search.trim() ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader size={28} color={C.purple} style={{ animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: C.textMuted, marginTop: '12px', fontSize: '13px' }}>Cargando recomendaciones...</p>
              </div>
            ) : displayTracks.length === 0 && search.trim().length >= 2 && !loading ? (
              <div style={{ textAlign: 'center', padding: '40px', background: C.bgCard, borderRadius: '16px', border: `1px solid ${C.border}` }}>
                <Music size={32} color={`${C.purple}44`} style={{ marginBottom: '12px' }} />
                <p style={{ color: C.textMuted, fontSize: '14px', margin: 0 }}>No se encontraron canciones para "{search}"</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayTracks.map(track => (
                  <TrackCard
                    key={track.spotifyTrackId}
                    track={track}
                    onRequest={handleRequest}
                    disabled={noCredits}
                    alreadyRequested={myTrackIds.includes(track.spotifyTrackId)}
                    isInQueue={queueTrackIds.includes(track.spotifyTrackId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Queue + Info */}
          <div style={{ position: 'sticky', top: '74px' }}>
            {/* Cola activa */}
            <div style={{
              background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px',
              overflow: 'hidden', marginBottom: '16px',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.purple }} />
                <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '13px' }}>Cola de reproducción</span>
                <span style={{
                  marginLeft: 'auto', background: `${C.purple}15`, border: `1px solid ${C.purple}33`,
                  color: C.purple, borderRadius: '20px', padding: '1px 8px',
                  fontSize: '10px', fontWeight: '800',
                }}>{queue.length}</span>
              </div>

              {queue.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <ListMusic size={28} color={`${C.purple}33`} style={{ marginBottom: '8px' }} />
                  <p style={{ color: C.textMuted, fontSize: '13px', margin: 0 }}>Sin canciones en cola</p>
                  <p style={{ color: C.textMuted, fontSize: '11px', margin: '4px 0 0' }}>¡Sé el primero en pedir!</p>
                </div>
              ) : (
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {queue.map((song, i) => (
                    <QueueItem key={song.id} song={song} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Mis canciones - con botón cancelar */}
            {myActiveSongs.length > 0 && (
              <div style={{
                background: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: '16px',
                overflow: 'hidden', marginBottom: '16px',
              }}>
                <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: C.teal }} />
                  <span style={{ color: C.textPrimary, fontWeight: '800', fontSize: '13px' }}>Mis canciones</span>
                </div>
                <div>
                  {myActiveSongs.map(song => (
                    <div key={song.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
                      borderBottom: `1px solid ${C.border}`,
                    }}>
                      {song.sImagenUrl && (
                        <img src={song.sImagenUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.textPrimary, fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.sNombre}
                        </div>
                        <div style={{
                          fontSize: '10px', fontWeight: '700', marginTop: '2px',
                          color: song.sEstado === 'reproduciendo' ? C.purple : C.teal,
                        }}>
                          {song.sEstado === 'reproduciendo' ? '♫ Reproduciéndose' : 'En cola'}
                        </div>
                      </div>
                      {song.sEstado === 'en_cola' && (
                        <button
                          onClick={() => setCancelModal(song)}
                          title="Cancelar canción"
                          style={{
                            background: `${C.pink}12`, border: `1px solid ${C.pink}44`,
                            borderRadius: '8px', padding: '5px 10px', color: C.pink,
                            fontFamily: FONT, fontWeight: '700', fontSize: '11px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                            transition: 'all 0.15s',
                          }}
                        >
                          <Trash2 size={11} /> Cancelar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info card */}
            <div style={{
              background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px',
              padding: '16px', fontSize: '12px', color: C.textSecondary, lineHeight: 1.7,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: C.purple, fontWeight: '800', fontSize: '13px' }}>
                <Radio size={14} /> ¿Cómo funciona?
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Busca tu canción favorita</li>
                <li>Tienes <strong style={{ color: C.textPrimary }}>3 canciones</strong> por estancia</li>
                <li>Solo música apta para todo público</li>
                <li>No puedes repetir la misma canción</li>
                <li>¡El cajero las reproduce en la taquería!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal de confirmación de cancelación ── */}
      {cancelModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setCancelModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.bgCard, border: `1.5px solid ${C.border}`,
            borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '90%',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'slideIn 0.25s ease',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 14px',
                background: `${C.pink}15`, border: `2px solid ${C.pink}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={24} color={C.pink} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: C.textPrimary, fontSize: '16px', fontWeight: '800' }}>
                ¿Cancelar canción?
              </h3>
              <p style={{ margin: 0, color: C.textSecondary, fontSize: '13px', lineHeight: 1.5 }}>
                Se cancelará <strong style={{ color: C.textPrimary }}>"{cancelModal.sNombre}"</strong> y recuperarás 1 crédito.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelModal(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: 'transparent', border: `1.5px solid ${C.border}`,
                  color: C.textSecondary, fontFamily: FONT, fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer',
                }}>
                No, mantener
              </button>
              <button onClick={confirmCancel}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  background: C.pink, border: 'none',
                  color: '#fff', fontFamily: FONT, fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer',
                }}>
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse {
          0% { background: ${C.purple}10; }
          50% { background: ${C.purple}18; }
          100% { background: ${C.purple}10; }
        }
        @media (max-width: 768px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Rockola;
