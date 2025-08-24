// src/pages/AddListing.jsx
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* Date -> "YYYY-MM-DDTHH:MM" (local) for datetime-local */
function toLocalInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${min}`;
}
/* phone -> wa.me digits (adds 91 if 10-digit) */
function waDigits(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length === 10 ? "91" + digits : digits;
}

export default function AddListing() {
  const navigate = useNavigate();
  const readyRef = useRef(null);
  const cookRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    food_type: "VEG",
    portions: "",
    pincode: "",
    cooking_time: toLocalInputValue(new Date()),   // NEW
    ready_until: toLocalInputValue(new Date()),
    tags: "",
    allergens: "",
    hygiene_ack: false,
    donor_name: "",
    donor_phone: "",
    donor_email: "",
    donor_address: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.title?.trim()) return "Please enter a title.";
    if (!form.portions || Number(form.portions) <= 0) return "Please enter portions (≥ 1).";
    if (!form.pincode?.trim()) return "Please enter a pincode.";
    if (!form.donor_name?.trim()) return "Please enter donor name.";
    if (!form.donor_phone?.trim()) return "Please enter donor phone.";
    if (form.donor_phone && !/^[0-9+\-\s()]{7,}$/.test(form.donor_phone)) return "Enter a valid phone number.";
    if (form.donor_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donor_email)) return "Enter a valid email.";

    // ---- NEW: date/time checks ----
    if (!form.cooking_time) return "Please set when the food was cooked.";
    if (!form.ready_until) return "Please set 'Ready until' (pick-up window end).";

    const now = new Date();
    const cooked = new Date(form.cooking_time);
    const ready = new Date(form.ready_until);

    if (cooked.getTime() > now.getTime()) return "Cooking time cannot be in the future.";
    if (ready.getTime() <= cooked.getTime())
      return "'Ready until' must be later than the cooking time.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    const v = validate();
    if (v) { setErr(v); return; }

    let newId = Date.now();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      food_type: form.food_type,
      portions: Number(form.portions) || 0,
      pincode: String(form.pincode || "").trim(),
      cooking_time: form.cooking_time,   // NEW
      ready_until: form.ready_until,
      tags: form.tags,
      allergens: form.allergens,
      hygiene_ack: !!form.hygiene_ack,
      donor: {
        name: form.donor_name.trim(),
        phone: form.donor_phone.trim(),
        email: form.donor_email.trim(),
        address: form.donor_address.trim(),
      },
    };

    try {
      const res = await axios.post("/api/listings", payload);
      if (res?.data?.id) newId = res.data.id;
    } catch (e) {
      console.warn("POST /api/listings failed; using local fallback.", e?.message);
    }

    // persist locally
    const saved = JSON.parse(localStorage.getItem("myListings") || "[]");
    const listing = { id: newId, ...payload, createdAt: new Date().toISOString() };
    saved.unshift(listing);
    localStorage.setItem("myListings", JSON.stringify(saved));

    setMsg(`Listing created #${newId}`);
    navigate("/donor/listings");
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h3 style={{ marginBottom: 12 }}>Add Listing</h3>

      {err && <div style={bannerError}>{err}</div>}
      {msg && <div style={bannerOk}>{msg}</div>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Listing */}
        <section style={section}>
          <div style={sectionTitle}>Listing details</div>

          <label style={lbl}>
            <span>Title</span>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Puri, Chhole, Rice + Dal" style={inp} required />
          </label>

          <label style={lbl}>
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description…" rows={3} style={ta} />
          </label>

          <div style={row2}>
            <label style={lbl}>
              <span>Food type</span>
              <select name="food_type" value={form.food_type} onChange={handleChange} style={inp}>
                <option value="VEG">VEG</option>
                <option value="NON-VEG">NON-VEG</option>
              </select>
            </label>

            <label style={lbl}>
              <span>Portions</span>
              <input type="number" name="portions" value={form.portions} onChange={handleChange} placeholder="e.g., 5" style={inp} min={1} required />
            </label>
          </div>

          {/* NEW: Cooking time + Ready until in one row */}
          <div style={row2}>
            <label style={lbl}>
              <span>Cooked at</span>
              <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    ref={cookRef}
                    type="datetime-local"
                    name="cooking_time"
                    value={form.cooking_time}
                    onChange={handleChange}
                    style={{ ...inp, paddingRight: 36, width: "100%" }}
                    step="60"
                    max={toLocalInputValue(new Date())}
                  />
                  <span
                    onClick={() => (cookRef.current?.showPicker?.(), cookRef.current?.focus())}
                    title="Open picker"
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      cursor: "pointer", fontSize: 18,
                    }}
                  >
                    🕒
                  </span>
                </div>

                <button type="button" style={btnGhost}
                  onClick={() => setForm((f) => ({ ...f, cooking_time: toLocalInputValue(new Date()) }))}>
                  Now
                </button>
                <button type="button" style={btnGhost}
                  onClick={() => {
                    const dt = new Date(); dt.setHours(dt.getHours() - 1);
                    setForm((f) => ({ ...f, cooking_time: toLocalInputValue(dt) }));
                  }}>
                  -1 hr
                </button>
              </div>
            </label>

            <label style={lbl}>
              <span>Ready until</span>
              <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    ref={readyRef}
                    type="datetime-local"
                    name="ready_until"
                    value={form.ready_until}
                    onChange={handleChange}
                    style={{ ...inp, paddingRight: 36, width: "100%" }}
                    step="60"
                    min={form.cooking_time || toLocalInputValue(new Date())}
                  />
                  {/* Calendar icon */}
                  <span
                    onClick={() => (readyRef.current?.showPicker?.(), readyRef.current?.focus())}
                    title="Open picker"
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      cursor: "pointer", fontSize: 18,
                    }}
                  >
                    📅
                  </span>
                </div>

                <button type="button" style={btnGhost}
                  onClick={() => setForm((f) => ({ ...f, ready_until: toLocalInputValue(new Date()) }))}>
                  Now
                </button>
                <button type="button" style={btnGhost}
                  onClick={() => {
                    const dt = new Date(); dt.setHours(dt.getHours() + 2);
                    setForm((f) => ({ ...f, ready_until: toLocalInputValue(dt) }));
                  }}>
                  +2 hr
                </button>
              </div>
            </label>
          </div>

          <div style={row2}>
            <label style={lbl}>
              <span>Tags (comma-separated)</span>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., spicy, low-oil" style={inp} />
            </label>

            <label style={lbl}>
              <span>Allergens</span>
              <input name="allergens" value={form.allergens} onChange={handleChange} placeholder="e.g., peanuts, gluten" style={inp} />
            </label>
          </div>

          <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="hygiene_ack" checked={form.hygiene_ack} onChange={handleChange} />
            <span>I follow basic hygiene while preparing/packing food</span>
          </label>
        </section>

        {/* Donor */}
        <section style={section}>
          <div style={sectionTitle}>Donor details</div>

          <div style={row2}>
            <label style={lbl}>
              <span>Donor name</span>
              <input name="donor_name" value={form.donor_name} onChange={handleChange} placeholder="Full name" style={inp} required />
            </label>

            <label style={lbl}>
              <span>Phone</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input name="donor_phone" value={form.donor_phone} onChange={handleChange} placeholder="+91 9XXXXXXXXX" style={{ ...inp, flex: 1 }} required />
                {/* Quick WhatsApp test */}
                <a
                  href={`https://wa.me/${waDigits(form.donor_phone)}?text=${encodeURIComponent(`Hi, regarding "${form.title}" on NutriBridge`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    textDecoration: "none", padding: "8px 12px", borderRadius: 10,
                    background: "#25D366", color: "#fff", fontWeight: 700
                  }}
                >
                  WhatsApp
                </a>
              </div>
            </label>
          </div>

          <label style={lbl}>
            <span>Email</span>
            <input type="email" name="donor_email" value={form.donor_email} onChange={handleChange} placeholder="name@example.com" style={inp} />
          </label>

          <label style={lbl}>
            <span>Address</span>
            <textarea name="donor_address" value={form.donor_address} onChange={handleChange} placeholder="Flat / Street, Area, City, State" rows={3} style={ta} />
          </label>
        </section>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={btnPrimary}>Create Listing</button>
          <button
            type="button"
            style={btnGhost}
            onClick={() =>
              setForm({
                title: "", description: "", food_type: "VEG", portions: "", pincode: "",
                cooking_time: toLocalInputValue(new Date()),
                ready_until: toLocalInputValue(new Date()),
                tags: "", allergens: "", hygiene_ack: false,
                donor_name: "", donor_phone: "", donor_email: "", donor_address: "",
              })
            }
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

/* Styles */
const section = { border: "1px solid #223043", background: "#11161d", borderRadius: 12, padding: 16, display: "grid", gap: 12 };
const sectionTitle = { fontWeight: 700, marginBottom: 4, color: "#e9edf3" };
const lbl = { display: "grid", gap: 6, fontSize: 14, color: "#e9edf3" };
const row2 = { display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" };
const inp = { padding: "8px 10px", borderRadius: 10, border: "1px solid #223043", background: "#0b0f14", color: "#e9edf3", width: "100%" };
const ta = { ...inp, resize: "vertical" };
const btnPrimary = { padding: "8px 12px", borderRadius: 10, border: "1px solid #223043", background: "#7ce2a1", color: "#0b0f14", fontWeight: 700, cursor: "pointer" };
const btnGhost = { padding: "8px 12px", borderRadius: 10, border: "1px solid #223043", background: "#11161d", color: "#c7cfdb", cursor: "pointer" };
const bannerOk = { marginBottom: 12, padding: "8px 10px", borderRadius: 8, background: "#11161d", border: "1px solid #223043", color: "#7ce2a1", fontSize: 14 };
const bannerError = { marginBottom: 12, padding: "8px 10px", borderRadius: 8, background: "#1a1010", border: "1px solid #4c1f1f", color: "#ff7a7a", fontSize: 14 };