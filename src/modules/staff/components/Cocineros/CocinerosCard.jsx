import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { C, FONT, glow } from "../../../../styles/designTokens";
import {
  Pencil,
  PowerOff,
  RotateCcw,
  Sun,
  Clock,
  Moon,
  ChefHat,
} from "lucide-react";

/* ─── CONFIGS ────────────────────────────────────────────────── */
const STATUS = {
  activo: { color: C.teal, label: "Activo" },
  inactivo: { color: C.textMuted, label: "Inactivo" },
};

const TURNO = {
  mañana: { Icon: Sun, label: "Mañana" },
  tarde: { Icon: Clock, label: "Tarde" },
  noche: { Icon: Moon, label: "Noche" },
};

/* ─── ACTION BUTTON ──────────────────────────────────────────── */
function ActionBtn({ label, Icon, color, onClick, fullWidth = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: fullWidth ? "1 1 100%" : "1",
        background: hov ? `${color}22` : `${color}12`,
        border: `1.5px solid ${hov ? color : color + "44"}`,
        borderRadius: "9px",
        padding: "8px 12px",
        color,
        fontFamily: FONT,
        fontWeight: "700",
        fontSize: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        transition: "all 0.18s ease",
        boxShadow: hov ? glow(color, "22") : "none",
      }}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

/* ─── Cocineros CARD ─────────────────────────────────────────────── */
const CocinerosCard = ({ cook, onEdit, onDelete, onStatusChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const [hov, setHov] = useState(false);

  const st = STATUS[cook.bActivo ? "activo" : "inactivo"];
  const tr = TURNO[cook.sTurno?.toLowerCase()] || {
    Icon: Clock,
    label: cook.sTurno,
  };
  const TrIcon = tr.Icon;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.bgCardHov : C.bgCard,
        border: `1.5px solid ${hov ? st.color : C.border}`,
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov
          ? `0 12px 32px rgba(0,0,0,0.35), ${glow(st.color, "18")}`
          : "0 2px 8px rgba(0,0,0,0.25)",
        transition: "all 0.22s ease",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          height: "4px",
          background: st.color,
          boxShadow: 'none',
        }}
      />
      <div style={{ padding: "18px 18px 16px" }}>
        {/* Nombre + Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "14px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: C.textPrimary,
              fontWeight: "800",
              fontSize: "17px",
              lineHeight: 1.2,
            }}
          >
            {cook.sNombre} {cook.sApellido}
          </h3>
          <span
            style={{
              background: `${st.color}18`,
              border: `1px solid ${st.color}55`,
              color: st.color,
              borderRadius: "20px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.4px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: "10px",
            }}
          >
            {st.label}
          </span>
        </div>

        {/* Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          {/* Especialidad */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: C.textSecondary,
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: `${C.pink}15`,
                border: `1px solid ${C.pink}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ChefHat size={13} color={C.pink} />
            </div>
            <span>{cook.sEspecialidad}</span>
          </div>

          {/* Turno */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: C.textSecondary,
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: `${C.teal}15`,
                border: `1px solid ${C.teal}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TrIcon size={13} color={C.teal} />
            </div>
            <span>{tr.label}</span>
          </div>

          {/* Email */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: C.textMuted,
              fontSize: "12px",
            }}
          >
            <span style={{ paddingLeft: "34px" }}>{cook.sEmail}</span>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
          {isAdmin && (
            <>
              {cook.bActivo && (
                <ActionBtn
                  label="Editar"
                  Icon={Pencil}
                  color={C.teal}
                  onClick={() => onEdit(cook)}
                />
              )}
              {cook.bActivo ? (
                <ActionBtn
                  label="Desactivar"
                  Icon={PowerOff}
                  color={C.textMuted}
                  onClick={() => onDelete(cook.id)}
                />
              ) : (
                <ActionBtn
                  label="Reactivar"
                  Icon={RotateCcw}
                  color={C.teal}
                  onClick={() => onStatusChange(cook.id, true)}
                  fullWidth
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
    //Se realiza ajuste
  );
};

export default CocinerosCard;




