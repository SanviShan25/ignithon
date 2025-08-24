import { useEffect, useState } from "react";

const waDigits = (raw) => {
  const d = String(raw || "").replace(/\D/g, "");
  return d.length === 10 ? "91" + d : d;
};

export default function MyRequests() {
  const [rows, setRows] = useState([]);

  const load = () => setRows(JSON.parse(localStorage.getItem("myRequests") || "[]"));

  useEffect(() => {
    load();
    const onStorage = (e) => { if (e.key === "myRequests") load(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!rows.length) return <div>No requests yet.</div>;

  const verifyOtp = (req) => {
    if (req.enteredOtp === req.otp) {
      const updated = rows.map((r) => (r.id === req.id ? { ...r, status: "Completed" } : r));
      setRows(updated);
      localStorage.setItem("myRequests", JSON.stringify(updated));
      alert("✅ OTP verified, pickup confirmed!");
    } else {
      alert("❌ Wrong OTP");
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.id} style={{ border: "1px solid #223043", borderRadius: 12, padding: 12, background: "#11161d" }}>
          <div style={{ fontWeight: 700 }}>{r.title}</div>
          <div>Status: {r.status}</div>

          {/* Show OTP input only if donor accepted and otp exists */}
          {r.status === "Accepted" && r.otp && (
            <div style={{ marginTop: 6 }}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={r.enteredOtp || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setRows(rows.map((row) => row.id === r.id ? { ...row, enteredOtp: val } : row));
                }}
              />
              <button onClick={() => verifyOtp(r)} style={{ marginLeft: 8 }}>Verify</button>
            </div>
          )}

          {r.phone && (
            <a
              href={`https://wa.me/${waDigits(r.phone)}?text=${encodeURIComponent(
                `Hello, my request for "${r.title}" is ${r.status}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 6, background: "#25D366", color: "#fff", padding: "6px 10px", borderRadius: 8 }}
            >
              WhatsApp Donor
            </a>
          )}
        </div>
      ))}
    </div>
  );
}