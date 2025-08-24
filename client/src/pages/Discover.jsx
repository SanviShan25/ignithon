import { useMemo, useState } from "react";

const SAMPLE = [
  { id: 101, title: "Veg Pulao + Raita", pincode: "110020", portions: 3, donor: { name: "Asha", phone: "9876543210" } },
  { id: 102, title: "Chapati + Dal Tadka", pincode: "110018", portions: 5, donor: { name: "Ravi", phone: "+91 9811122233" } },
  { id: 103, title: "Rice + Chhole", pincode: "560001", portions: 2, donor: { name: "Leena", phone: "9988776655" } },
];

const digits = (x) => String(x || "").replace(/\D/g, "");

export default function Discover() {
  const [pin, setPin] = useState("");
  const saved = useMemo(() => JSON.parse(localStorage.getItem("myListings") || "[]"), []);
  const feed = [...saved, ...SAMPLE];
  const filtered = feed.filter((x) => (pin ? String(x.pincode || "").includes(pin) : true));

  const handleClaim = (item) => {
    const req = {
      id: Date.now(),
      listingId: item.id ?? null,
      title: item.title,
      status: "Pending",
      when: new Date().toISOString(),
      phone: item?.donor?.phone || "",
      otp: null,
    };

    // consumer side
    const reqs = JSON.parse(localStorage.getItem("myRequests") || "[]");
    reqs.unshift(req);
    localStorage.setItem("myRequests", JSON.stringify(reqs));

    // donor side
    const donorPhone = digits(item?.donor?.phone);
    if (donorPhone) {
      const inbox = JSON.parse(localStorage.getItem("inboxByPhone") || "{}");
      if (!inbox[donorPhone]) inbox[donorPhone] = [];
      inbox[donorPhone].unshift({ ...req, message: `Request for "${item.title}" (${item.portions} portions)` });
      localStorage.setItem("inboxByPhone", JSON.stringify(inbox));
    }

    alert("Request sent to donor!");
  };

  return (
    <div>
      <input
        placeholder="Filter by pincode…"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        style={{ marginBottom: 12, padding: "8px 10px", borderRadius: 8 }}
      />
      {!filtered.length ? (
        <div>No results.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((item) => (
            <div key={item.id} style={{ border: "1px solid #223043", borderRadius: 12, padding: 12, background: "#11161d" }}>
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              <div style={{ fontSize: 13 }}>Portions: {item.portions} · Pincode: {item.pincode}</div>
              {item.donor?.name && <div style={{ fontSize: 12 }}>Donor: {item.donor.name}</div>}
              <button onClick={() => handleClaim(item)} style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "#7ce2a1", fontWeight: 700 }}>
                Claim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
