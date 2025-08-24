// src/pages/Landing.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const QUOTES = [
  "Save food. Save money. Save the planet.",
  "When you waste food, you waste everything that went into it.",
  "Every shared meal is a story that didn’t end in the bin.",
  "Small portions of kindness add up to zero hunger.",
];

export default function Landing() {
  // rotate quotes every 4s
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);
  const quote = useMemo(() => QUOTES[i], [i]);

  // simple hover states (inline styles ko hover dene ke liye)
  const [hover, setHover] = useState({ donate: false, consume: false });
  const [cardHover, setCardHover] = useState([-1]);

  return (
    <div style={page}>
      {/* ambient glows */}
      <div style={bg1} />
      <div style={bg2} />

      <section style={heroWrap}>
        {/* Optional hero image (public/images/hero.jpg). Gradient fallback rahega agar image nahi hai */}
        <div
          aria-hidden
          style={{
            ...heroImg,
            backgroundImage:
              "linear-gradient(0deg, rgba(11,15,20,0.35), rgba(11,15,20,0.35)), url('/images/hero.jpg')",
          }}
        />

        <div style={badge}>
          <span style={dot} /> Community-powered food rescue
        </div>

        <h1 style={h1}>
          Bridge surplus <span style={gradTxt}>food</span> to hungry plates.
        </h1>

        <p style={sub}>
          NutriBridge helps donors share extra, fresh food with nearby seekers—
          fast, safe and free.
        </p>

        {/* primary CTAs */}
        <div style={ctaRow}>
          <Link
            to="/donor"
            onMouseEnter={() => setHover(h => ({ ...h, donate: true }))}
            onMouseLeave={() => setHover(h => ({ ...h, donate: false }))}
            style={{
              ...ctaPrimary,
              transform: hover.donate ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hover.donate
                ? "0 14px 34px rgba(124,226,161,.35)"
                : "0 8px 24px rgba(124,226,161,.25)",
              filter: hover.donate ? "saturate(112%)" : "saturate(100%)",
              outline: "none",
            }}
          >
            🍲 I want to Donate
          </Link>

          <Link
            to="/consumer"
            onMouseEnter={() => setHover(h => ({ ...h, consume: true }))}
            onMouseLeave={() => setHover(h => ({ ...h, consume: false }))}
            style={{
              ...ctaSecondary,
              transform: hover.consume ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hover.consume
                ? "0 10px 28px rgba(0,0,0,.45)"
                : "0 6px 20px rgba(0,0,0,.35)",
              borderColor: hover.consume ? "#2a3b54" : "#223043",
              filter: hover.consume ? "saturate(112%)" : "saturate(100%)",
              outline: "none",
            }}
          >
            🥗 I want to Consume
          </Link>
        </div>

        {/* rotating quote */}
        <div style={quoteWrap}>
          <span style={quoteMark}>“</span>
          <span>{quote}</span>
          <span style={quoteMark}>”</span>
        </div>

        {/* mini feature hints */}
        <div style={hintRow}>
          <div style={hintItem}><span style={hintDot("#7ce2a1")} /> 2-minute listing</div>
          <div style={hintItem}><span style={hintDot("#4ad6ff")} /> WhatsApp connect</div>
          <div style={hintItem}><span style={hintDot("#ffd166")} /> Hygiene first</div>
        </div>
      </section>

      {/* 3-up benefits */}
      <section style={cardsGrid}>
        <Card
          onHover={(v) => setCardHover([v ? 0 : -1])}
          hovered={cardHover[0] === 0}
          icon="🧾"
          title="List surplus in a snap"
          body="Add portions, pin code & a ready-until time. We surface it to nearby consumers."
        />
        <Card
          onHover={(v) => setCardHover([v ? 1 : -1])}
          hovered={cardHover[0] === 1}
          icon="📍"
          title="Claim in one tap"
          body="Search by pin code, check hygiene badge & claim. Get directions and WhatsApp the donor."
        />
        <Card
          onHover={(v) => setCardHover([v ? 2 : -1])}
          hovered={cardHover[0] === 2}
          icon="🌍"
          title="Reduce waste, build care"
          body="Every share keeps food out of landfills and puts it on someone’s plate instead."
        />
      </section>
    </div>
  );
}

/* small presentational card */
function Card({ icon, title, body, hovered = false, onHover = () => {} }) {
  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        ...card,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,.45), inset 0 0 0 1px #2a3b54"
          : "0 8px 28px rgba(0,0,0,.35)",
        borderColor: hovered ? "#2a3b54" : "#223043",
      }}
    >
      <div style={cardIcon}>{icon}</div>
      <div style={cardTitle}>{title}</div>
      <div style={cardBody}>{body}</div>
    </div>
  );
}

/* styles (inline to match your app) */
const page = {
  position: "relative",
  color: "#e9edf3",
  minHeight: "calc(100vh - 140px)",
  background: "#0b0f14",
};
const bg1 = {
  position: "absolute",
  inset: "-10% -10% auto -10%",
  height: 420,
  background:
    "radial-gradient(900px 420px at 10% -10%, rgba(124,226,161,.18), transparent)",
};
const bg2 = {
  position: "absolute",
  inset: "auto -10% -10% 40%",
  height: 380,
  background:
    "radial-gradient(800px 380px at 80% 110%, rgba(74,214,255,.15), transparent)",
};
const heroWrap = {
  position: "relative",
  maxWidth: 1120,
  margin: "0 auto",
  padding: "56px 16px 28px",
  textAlign: "left",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,.45)",
};
const heroImg = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity: 0.22, // dark theme readability
  pointerEvents: "none",
};
const badge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #223043",
  background: "#11161d",
  color: "#c7cfdb",
  fontSize: 13,
  position: "relative",
  zIndex: 1,
};
const dot = { width: 10, height: 10, borderRadius: 3, background: "#7ce2a1" };
const h1 = {
  margin: "14px 0 8px",
  fontWeight: 800,
  fontSize: "clamp(28px, 4.4vw, 42px)",
  lineHeight: 1.15,
  position: "relative",
  zIndex: 1,
  textShadow: "0 2px 16px rgba(0,0,0,.55)",
};
const gradTxt = {
  background: "linear-gradient(90deg,#7ce2a1,#4ad6ff)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
const sub = {
  opacity: 0.9,
  maxWidth: 720,
  marginBottom: 16,
  fontSize: 16,
  position: "relative",
  zIndex: 1,
};
const ctaRow = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, position: "relative", zIndex: 1 };
const ctaBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #223043",
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
  transition: "transform .16s ease, box-shadow .16s ease, filter .16s ease, border-color .16s ease",
};
const ctaPrimary = {
  ...ctaBase,
  background: "#7ce2a1",
  color: "#0b0f14",
  boxShadow: "0 8px 24px rgba(124,226,161,.25)",
};
const ctaSecondary = {
  ...ctaBase,
  background: "#11161d",
  color: "#c7cfdb",
  boxShadow: "0 6px 20px rgba(0,0,0,.35)",
};
const quoteWrap = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #223043",
  background:
    "linear-gradient(0deg, rgba(22,32,44,.55), rgba(22,32,44,.55)), rgba(17,22,29,.9)",
  maxWidth: 720,
  fontSize: 15.5,
  display: "flex",
  alignItems: "center",
  gap: 8,
  position: "relative",
  zIndex: 1,
};
const quoteMark = { opacity: 0.7, fontSize: 18 };
const hintRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 12,
  color: "#a6b0bf",
  fontSize: 13,
  position: "relative",
  zIndex: 1,
};
const hintItem = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #223043",
  background: "#0f141b",
};
const hintDot = (c) => ({ width: 10, height: 10, borderRadius: 99, background: c });
const cardsGrid = {
  position: "relative",
  maxWidth: 1120,
  margin: "14px auto 36px",
  padding: "0 16px",
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
};
const card = {
  padding: 16,
  borderRadius: 14,
  border: "1px solid #223043",
  background: "#10161d",
  minHeight: 140,
  display: "grid",
  gap: 8,
  transition: "transform .16s ease, box-shadow .16s ease, border-color .16s ease",
};
const cardIcon = { fontSize: 24 };
const cardTitle = { fontWeight: 800, fontSize: 16.5 };
const cardBody = { fontSize: 14, color: "#c7cfdb" };