import { useMemo, useState } from "react";
import { api } from "../api"; // using axios instance

export default function ListingCard({ item, onChanged }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ seeker_name: "", seeker_phone: "", qty: 1 });

  const expired = new Date(item.ready_until) <= new Date();

  // Build a polite WhatsApp message (URL-encoded)
  const waText = useMemo(() => {
    const msg = `Hello ${item.donor_name || ""},
I saw your listing on FoodLink and would like to request it.

• Item: ${item.title} (${String(item.food_type || "").toUpperCase()})
• Qty wanted: ${form.qty || 1}
• Pincode: ${item.pincode}
• Ready until: ${new Date(item.ready_until).toLocaleString()}

My name: ${form.seeker_name || "—"}
Phone: ${form.seeker_phone || "—"}

If this works, please confirm. Thanks! (Listing #${item.id})`;
    return encodeURIComponent(msg);
  }, [item, form.qty, form.seeker_name, form.seeker_phone]);

  const onInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "qty" ? Number(value) : value }));
  };

  const createRequest = async () => {
    // simple checks
    if (!form.seeker_name?.trim()) return alert("Please enter your name.");
    if (!form.qty || form.qty < 1) return alert("Enter a valid quantity.");
    if (form.qty > (item.portions || 0)) return alert("Requested qty exceeds available portions.");

    try {
      // 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000);

      const payload = {
        listingId: item.id,
        seeker_name: form.seeker_name.trim(),
        seeker_phone: form.seeker_phone?.trim() || "",
        qty: Number(form.qty || 1),
        status: "REQUESTED",
        otp, // ✅ saved with request
        created_at: new Date().toISOString(),
      };

      await api.post("/requests", payload);

      // remember consumer phone for "My Requests" page
      if (payload.seeker_phone) localStorage.setItem("consumer_phone", payload.seeker_phone);

      setOpen(false);
      alert("Request sent! You can track it in My Requests.");
      onChanged?.(); // refresh parent list
    } catch (err) {
      console.error(err);
      alert("Failed to create request. Is the API running?");
    }
  };

  return (
    <div style={{ border: "1px solid #555", padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{item.title}</div>
      <div>Type: {String(item.food_type || "").toUpperCase()}</div>
      <div>Portions: {item.portions}</div>
      <div>Pincode: {item.pincode}</div>
      <div>Ready until: {new Date(item.ready_until).toLocaleString()}</div>
      <div>Hygiene: {item.hygiene_ack ? "✅" : "❌"}</div>

      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          disabled={expired || (item.portions || 0) <= 0}
          onClick={() => setOpen(true)}
          style={{ padding: "6px 10px", border: "1px solid #888", borderRadius: 6, cursor: expired ? "not-allowed" : "pointer" }}
          title={expired ? "This listing has expired" : "Claim this listing"}
        >
          {expired ? "Expired" : "Claim"}
        </button>

        <a
          href={
            item.donor_phone
              ? `https://wa.me/${item.donor_phone}?text=${waText}`
              : undefined
          }
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "6px 10px",
            border: "1px solid #888",
            borderRadius: 6,
            textDecoration: "none",
            opacity: item.donor_phone ? 1 : 0.6,
            pointerEvents: item.donor_phone ? "auto" : "none",
          }}
          title={item.donor_phone ? "Message donor on WhatsApp" : "Donor phone not provided"}
        >
          WhatsApp Donor
        </a>
      </div>

      {open && (
        <div style={{ marginTop: 10, padding: 10, border: "1px dashed #777", borderRadius: 6 }}>
          <div style={{ marginBottom: 6, fontWeight: 600 }}>Enter your details</div>

          <input
            name="seeker_name"
            placeholder="Your name"
            value={form.seeker_name}
            onChange={onInput}
            style={{ width: "100%", marginBottom: 6, padding: 6 }}
          />
          <input
            name="seeker_phone"
            placeholder="Phone (optional)"
            value={form.seeker_phone}
            onChange={onInput}
            style={{ width: "100%", marginBottom: 6, padding: 6 }}
          />
          <input
            name="qty"
            type="number"
            min={1}
            max={Math.max(1, item.portions || 1)}
            placeholder="Quantity"
            value={form.qty}
            onChange={onInput}
            style={{ width: "100%", marginBottom: 6, padding: 6 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={createRequest} style={{ padding: "6px 10px", border: "1px solid #888", borderRadius: 6 }}>
              Send Request
            </button>
            <button onClick={() => setOpen(false)} style={{ padding: "6px 10px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}