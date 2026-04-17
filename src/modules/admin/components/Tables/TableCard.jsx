import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { C, FONT, glow } from '../../../../styles/designTokens';
import {
  Users, Pencil, PowerOff, RotateCcw,
  CheckCircle, DoorOpen, Star,
  TreePine, Sun, Armchair, BellRing
} from 'lucide-react';

/* ─── CONFIG ─────────────────────────────────────────────────── */
const STATUS = {
  disponible: { color: C.teal,     label: "Disponible" },
  ocupada:    { color: C.orange,   label: "Ocupada"    },
  reservada:  { color: C.yellow,   label: "Reservada"  },
  inactiva:   { color: C.textMuted,label: "Inactiva"   },
};

const UBICACION = {
  interior: { Icon: Armchair,  label: "Interior" },
  exterior: { Icon: TreePine,  label: "Exterior" },
  terraza:  { Icon: Sun,       label: "Terraza"  },
  vip:      { Icon: Star,      label: "VIP"      },
};

/* ─── TABLE CARD ─────────────────────────────────────────────── */
const TableCard = ({ table, onEdit, onDelete, onStatusChange, onAttendCall }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hov,        setHov]        = useState(false);
  const [ocupando,   setOcupando]   = useState(false);

  const st  = STATUS[table.sEstado]   || STATUS.inactiva;
  const ub  = UBICACION[table.sUbicacion] || { Icon: Armchair, label: table.sUbicacion };
  const UbIcon = ub.Icon;

  const isDisponible = table.sEstado === 'disponible';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:    hov ? C.bgCardHov : C.bgCard,
        border:        `1.5px solid ${hov ? st.color : C.border}`,
        borderRadius:  "16px",
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
        transform:     hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow:     hov
          ? `0 12px 32px rgba(0,0,0,0.35), ${glow(st.color, "18")}`
          : "0 2px 8px rgba(0,0,0,0.25)",
        transition:    "all 0.22s ease",
        position:      "relative",
        fontFamily:    FONT,
      }}
    >
      {/* Franja de color por estado */}
      <div style={{
        height: "4px",
        background: st.color,
        boxShadow: 'none',
      }} />

      <div style={{ padding: "18px 18px 16px" }}>

        {/* ── Fila superior ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <h3 style={{
            margin: 0,
            color: C.textPrimary,
            fontWeight: "800",
            fontSize: "17px",
            lineHeight: 1.2,
          }}>
            {table.sNombre}
          </h3>

          {/* Badge de estado */}
          <span style={{
            background:   `${st.color}18`,
            border:       `1px solid ${st.color}55`,
            color:         st.color,
            borderRadius: "20px",
            padding:      "3px 10px",
            fontSize:     "11px",
            fontWeight:   "700",
            letterSpacing:"0.4px",
            whiteSpace:   "nowrap",
            flexShrink:    0,
            marginLeft:   "10px",
          }}>
            {st.label}
          </span>
        </div>

        {/* ── Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
          {/* Capacidad */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.textSecondary, fontSize: "13px" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "7px",
              background: `${C.pink}15`, border: `1px solid ${C.pink}30`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Users size={13} color={C.pink} />
            </div>
            <span>{table.iCapacidad} persona{table.iCapacidad !== 1 ? "s" : ""}</span>
          </div>

          {/* Ubicación */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: C.textSecondary, fontSize: "13px" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "7px",
              background: `${C.teal}15`, border: `1px solid ${C.teal}30`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <UbIcon size={13} color={C.teal} />
            </div>
            <span>{ub.label}</span>
          </div>

          {/* ALERTA: LLAMADO A MESERO */}
          {table.bLlamandoMesero && (
            <div style={{
              marginTop: '4px',
              padding: '8px 12px',
              background: `${C.orange}22`,
              border: `1px solid ${C.orange}55`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: C.orange,
              fontWeight: '700',
              fontSize: '13px',
              animation: 'pulse 2s infinite'
            }}>
              <BellRing size={15} style={{ animation: 'ring 1.5s infinite' }} />
              <div>
                Reclama Ayuda
                <div style={{ fontSize: '11px', color: C.textSecondary, fontWeight: '600' }}>
                  De: {table.sLlamandoContexto || 'Desconocido'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Descripción ── */}
        {table.sDescripcion && (
          <p style={{
            margin: "0 0 14px",
            paddingTop: "12px",
            borderTop: `1px dashed ${C.border}`,
            color: C.textMuted,
            fontSize: "12.5px",
            lineHeight: "1.55",
          }}>
            {table.sDescripcion}
          </p>
        )}

        {/* ── Acciones ── */}
        <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          {isAdmin ? (
            <>
              {/* Editar — solo si no está inactiva */}
              {table.sEstado !== 'inactiva' && (
                <ActionBtn
                  label="Editar"
                  Icon={Pencil}
                  color={C.teal}
                  onClick={() => onEdit(table)}
                />
              )}
              {/* Desactivar / Reactivar */}
              {table.sEstado === 'inactiva' ? (
                <ActionBtn
                  label="Reactivar"
                  Icon={RotateCcw}
                  color={C.teal}
                  onClick={() => onStatusChange(table.id, 'disponible')}
                  fullWidth
                />
              ) : (
                <ActionBtn
                  label="Desactivar"
                  Icon={PowerOff}
                  color={C.textMuted}
                  onClick={() => onDelete(table.id)}
                />
              )}
            </>
          ) : (
            /* Mesero: ocupar / liberar (solo mesas activas) */
            table.sEstado !== 'inactiva' && (
              <ActionBtn
                label={ocupando ? "Ocupando..." : isDisponible ? "Ocupar mesa" : "Liberar mesa"}
                Icon={isDisponible ? DoorOpen : CheckCircle}
                color={isDisponible ? C.orange : C.teal}
                disabled={ocupando}
                onClick={async () => {
                  if (isDisponible) {
                    setOcupando(true);
                    try {
                      // Guardar mesa seleccionada ANTES de cambiar estado
                      localStorage.setItem('meseroMesaId', table.id);
                      localStorage.setItem('meseroMesaNombre', table.sNombre);
                      // Esperar a que el backend confirme el cambio
                      await onStatusChange(table.id, 'ocupada');
                      // Navegar DESPUÉS de que el backend ya actualizó el estado
                      navigate('/menu');
                    } catch (e) {
                      localStorage.removeItem('meseroMesaId');
                      localStorage.removeItem('meseroMesaNombre');
                      setOcupando(false);
                    }
                  } else {
                    // Liberar mesa
                    localStorage.removeItem('meseroMesaId');
                    localStorage.removeItem('meseroMesaNombre');
                    await onStatusChange(table.id, 'disponible');
                  }
                }}
                fullWidth
              />
            )
          )}

          {/* Atender Llamada extra button for Meseros */}
          {!isAdmin && table.bLlamandoMesero && (
            <ActionBtn
              label="Atender llamada"
              Icon={CheckCircle}
              color={C.orange}
              onClick={() => onAttendCall(table.id)}
              fullWidth
            />
          )}

        </div>

      </div>
    </div>
  );
};

/* ─── ACTION BUTTON ──────────────────────────────────────────── */
function ActionBtn({ label, Icon, color, onClick, fullWidth = false, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex:           fullWidth ? "1" : "1",
        background:     disabled ? `${color}08` : hov ? `${color}22` : `${color}12`,
        border:         `1.5px solid ${disabled ? color + "22" : hov ? color : color + "44"}`,
        borderRadius:   "9px",
        padding:        "8px 12px",
        color:          disabled ? `${color}66` : color,
        fontFamily:      FONT,
        fontWeight:     "700",
        fontSize:       "12px",
        cursor:         disabled ? "not-allowed" : "pointer",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "5px",
        transition:     "all 0.18s ease",
        boxShadow:      hov && !disabled ? glow(color, "22") : "none",
      }}
    >
      <Icon size={13} />
      {label}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(253, 126, 20, 0); }
          100% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0); }
        }
        @keyframes ring {
          0% { transform: rotate(0); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          30% { transform: rotate(5deg); }
          40% { transform: rotate(-5deg); }
          50% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
      `}</style>
    </button>
  );
}

export default TableCard;



