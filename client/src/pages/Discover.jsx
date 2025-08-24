// src/pages/consumer/Discover.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* pretty date-time like "24 Aug 2025, 7:30 PM" */
function fmtDT(v) {
  if (!v) return "-";
  const d = new Date(v);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

/* minutes from now (negative = past) */
function minsFromNow(v) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Math.round((t - Date.now()) / 60000);
}

export default function ConsumerDiscover() {
  const [all, setAll] = useState([]);
  const [pin, setPin] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      // server data
      let rows = [];
      try {
        const res = await axios.get("/api/listings");
        rows = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.warn("GET /api/listings failed, using local only.", e?.message);
      }
      // local “myListings” (created by donor page fallback)
      const local = JSON.parse(localStorage.getItem("myListings") || "[]");
      // merge (server first, then local not already present)
      const byId = new Map();
      rows.forEach((r) => byId.set(r.id ?? r._id ?? Math.random(), r));
      local.forEach((r) => {
        const key = r.id ?? r._id ?? `${r.title}-${r.createdAt}`;
        if (!byId.has(key)) byId.set(key, r);
      });
      const merged = Array.from(byId.values());

      if (mounted) setAll(merged);
    }

    load();
    return () => { mounted = false; };
  }, []);

  const list = useMemo(() => {
    let rows = [...all];
    if (pin.trim()) rows = rows.filter((r) => String(r.pincode || "").includes(pin.trim()));
    return rows;
  }, [all, pin]);

  const claim = (item) => {
    // stub: navigate to claim flow / request create
    alert(`Claiming "${item.title}" from ${item?.donor?.name || "donor"}`);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ color: "#e9edf3", margin: 0 }}>Consumer Flow</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          placeholder="Filter by pincode..."
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={inp}
        />
      </div>

      {list.map((it) => {
        const cooked = it.cooking_time;
        const ready = it.ready_until;
        const minsLeft = minsFromNow(ready);
        const staleCook = minsFromNow(cooked) < -720; // cooked more than 12h ago?

        return (
          <div key={it.id ?? it._id ?? it.title} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#e9edf3", fontSize: 18 }}>{it.title}</div>
                <div style={muted}>Portions: {it.portions ?? "-"}</div>
                <div style={muted}>Pincode: {it.pincode ?? "-"}</div>
                <div style={muted}>Donor: {it?.donor?.name || it.donor_name || "-"}</div>

                {/* NEW lines */}
                <div style={{ marginTop: 6, color: "#c7cfdb" }}>
                  <span style={{ fontWeight: 600 }}>Cooked at:</span> {fmtDT(cooked)}{" "}
                  {staleCook && <span style={badgeWarn}>stale?</span>}
                </div>
                <div style={{ color: "#c7cfdb" }}>
                  <span style={{ fontWeight: 600 }}>Ready until:</span> {fmtDT(ready)}{" "}
                  {minsLeft <= 0 ? (
                    <span style={badgeDanger}>expired</span>
                  ) : minsLeft < 60 ? (
                    <span style={badgeSoon}>ends soon</span>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  disabled={(it.portions ?? 0) <= 0 || minsLeft <= 0}
                  onClick={() => claim(it)}
                  style={{
                    ...btnPrimary,
                    opacity: (it.portions ?? 0) <= 0 || minsLeft <= 0 ? 0.6 : 1,
                    cursor: (it.portions ?? 0) <= 0 || minsLeft <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {minsLeft <= 0 ? "Closed" : "Claim"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {list.length === 0 && (
        <div style={emptyBox}>No listings match this filter.</div>
      )}
    </div>
  );
}

/* styles (matches your dark theme) */
const card = { padding: 16, borderRadius: 12, background: "#0f141b", border: "1px solid #223043" };
const inp = { padding: "8px 10px", borderRadius: 10, border: "1px solid #223043", background: "#0b0f14", color: "#e9edf3" };
const muted = { color: "#a6b0bf", fontSize: 13 };
const btnPrimary = { padding: "8px 12px", borderRadius: 10, border: "1px solid #223043", background: "#7ce2a1", color: "#0b0f14", fontWeight: 700 };
const emptyBox = { padding: 16, color: "#c7cfdb", border: "1px dashed #223043", borderRadius: 12, background: "#0b0f14" };
const badgeWarn = { marginLeft: 8, padding: "2px 6px", borderRadius: 8, background: "#3a2f13", color: "#ffcf66", border: "1px solid #5a440e", fontSize: 11 };
const badgeSoon = { marginLeft: 8, padding: "2px 6px", borderRadius: 8, background: "#112a1c", color: "#7ce2a1", border: "1px solid #1b4a30", fontSize: 11 };
const badgeDanger = { marginLeft: 8, padding: "2px 6px", borderRadius: 8, background: "#351616", color: "#ff7a7a", border: "1px solid #4c1f1f", fontSize: 11 };