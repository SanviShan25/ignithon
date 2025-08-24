import { useEffect, useState } from "react";

const digits = (x) => String(x || "").replace(/\D/g, "");
const waDigits = (raw) => {
  const d = digits(raw);
  return d.length === 10 ? "91" + d : d;
};

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [myPhone, setMyPhone] = useState("");
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("myListings") || "[]");
    setListings(saved);
    if (saved[0]?.donor?.phone) setMyPhone(digits(saved[0].donor.phone));
  }, []);

  useEffect(() => {
    if (!myPhone) return;
    const all = JSON.parse(localStorage.getItem("inboxByPhone") || "{}");
    setInbox(all[myPhone] || []);
  }, [myPhone]);

  const saveInbox = (next) => {
    const all = JSON.parse(localStorage.getItem("inboxByPhone") || "{}");
    all[myPhone] = next;
    localStorage.setItem("inboxByPhone", JSON.stringify(all));
    setInbox(next);
  };

  const setRequestStatus = (reqId, newStatus) => {
    const otp = newStatus === "Accepted" ? String(Math.floor(1000 + Math.random() * 9000)) : null;

    // 1. update donor inbox
    const nextInbox = inbox.map((r) =>
      r.id === reqId ? { ...r, status: newStatus, otp } : r
    );
    saveInbox(nextInbox);

    // 2. update consumer myRequests
    const reqs = JSON.parse(localStorage.getItem("myRequests") || "[]");
    const nextReqs = reqs.map((r) =>
      r.id === reqId ? { ...r, status: newStatus, otp } : r
    );
    localStorage.setItem("myRequests", JSON.stringify(nextReqs));
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {listings.map((L) => {
        const reqs = inbox.filter((r) => r.listingId === L.id || r.title === L.title);
        return (
          <div key={L.id} style={{ border: "1px solid #223043", borderRadius: 12, padding: 12, background: "#11161d" }}>
            <div style={{ fontWeight: 700 }}>{L.title}</div>
            <div>Portions: {L.portions} · Pincode: {L.pincode}</div>

            <div style={{ marginTop: 8 }}>
              <strong>Requests ({reqs.length})</strong>
              {reqs.map((r) => (
                <div key={r.id} style={{ marginTop: 6, padding: 8, borderRadius: 8, background: "#0b0f14" }}>
                  <div>{r.title} — {r.status}</div>
                  {r.otp && <div style={{ color: "#7ce2a1" }}>OTP: {r.otp}</div>}
                  <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                    <button onClick={() => setRequestStatus(r.id, "Accepted")} disabled={r.status === "Accepted"}>Accept</button>
                    <button onClick={() => setRequestStatus(r.id, "Rejected")} disabled={r.status === "Rejected"}>Reject</button>
                    {r.phone && (
                      <a
                        href={`https://wa.me/${waDigits(r.phone)}?text=${encodeURIComponent(
                          `Your request for "${r.title}" is ${r.status}. OTP: ${r.otp || "N/A"}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: "#25D366", color: "#fff", padding: "4px 8px", borderRadius: 8 }}
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}