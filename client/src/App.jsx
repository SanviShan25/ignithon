import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import HealthChatbotLite from "./components/HealthChatbotLite.jsx";

/* Pages */
import Discover from "./pages/Discover.jsx";
import AddListing from "./pages/AddListing.jsx";
import MyRequests from "./pages/consumer/MyRequests.jsx";
import MyListings from "./pages/MyListings.jsx";

/* Landing (UI/UX only; functionality same) */
function Landing() {
  return (
    <div>

      {/* ==== HERO ==== */}
      <section style={heroWrap}>
        {/* Background image (optional). If you add /images/hero.jpg, it will show. */}
        <div
          style={{
            ...heroImg,
            backgroundImage:
              "url('/images/hero.jpg'), radial-gradient(1200px 600px at 20% -10%, rgba(124,226,161,.10), transparent)",
          }}
        />
        <div style={heroOverlay} />
        <div style={heroContent}>
          <h1 style={heroTitle}>Welcome to NutriBridge</h1>
          <p style={heroSub}>Choose your role:</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/donor" style={{ ...pillLink, ...pillHover }}>I’m a Donor</Link>
            <Link to="/consumer" style={{ ...pillLink, ...pillHover }}>I’m a Consumer</Link>
          </div>
        </div>
      </section>

      {/* ==== HOW IT WORKS (visual only) ==== */}
      <section style={howWrap} id="how">
        <h2 style={howTitle}>How NutriBridge Works</h2>

        <div style={cardsGrid}>
          <div style={howCard}>
            <div style={howIcon}>🥕</div>
            <h3 style={cardTitle}>Donors Share</h3>
            <p style={cardText}>
              Individuals and organizations list surplus food items quickly and safely.
            </p>
          </div>

          <div style={howCard}>
            <div style={howIcon}>🛒</div>
            <h3 style={cardTitle}>Consumers Receive</h3>
            <p style={cardText}>
              Consumers discover nearby listings and place requests with one tap.
            </p>
          </div>

          <div style={howCard}>
            <div style={howIcon}>🌍</div>
            <h3 style={cardTitle}>Community Benefits</h3>
            <p style={cardText}>
              Reduce waste, support neighbors, and build a sustainable community.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Consumer layout (sub-tabs) */
function ConsumerLayout() {
  const loc = useLocation();
  const active = (p) => (loc.pathname === p ? activeTab : {});
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Consumer Flow</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <NavLink to="/consumer" style={{ ...subtab, ...active("/consumer"), ...tabHover }}>
          Discover
        </NavLink>
        <NavLink to="/consumer/requests" style={{ ...subtab, ...active("/consumer/requests"), ...tabHover }}>
          My Requests
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}

/* Donor layout (sub-tabs) */
function DonorLayout() {
  const loc = useLocation();
  const active = (p) => (loc.pathname === p ? activeTab : {});
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Donor Flow</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <NavLink to="/donor/listings" style={{ ...subtab, ...active("/donor/listings"), ...tabHover }}>
          My Listings
        </NavLink>
        <NavLink to="/donor/add" style={{ ...subtab, ...active("/donor/add"), ...tabHover }}>
          Add Listing
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <header style={headerStyle}>
        <div style={headerInner}>
          <Link to="/" style={brandLink}>
            <span style={brandDot} />
            <strong style={{ fontSize: 18 }}>NutriBridge</strong>
          </Link>
          <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <NavLink to="/" style={({ isActive }) => ({ ...navLink, ...(isActive ? activeTab : {}), ...tabHover })}>Home</NavLink>
            <NavLink to="/donor" style={({ isActive }) => ({ ...navLink, ...(isActive ? activeTab : {}), ...tabHover })}>Donor</NavLink>
            <NavLink to="/consumer" style={({ isActive }) => ({ ...navLink, ...(isActive ? activeTab : {}), ...tabHover })}>Consumer</NavLink>
          </nav>
        </div>
      </header>

      <main style={mainStyle}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 16px" }}>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Donor */}
            <Route path="/donor" element={<DonorLayout />}>
              <Route index element={<MyListings />} />
              <Route path="listings" element={<MyListings />} />
              <Route path="add" element={<AddListing />} />
            </Route>

            {/* Consumer */}
            <Route path="/consumer" element={<ConsumerLayout />}>
              <Route index element={<Discover />} />
              <Route path="discover" element={<Discover />} />
              <Route path="requests" element={<MyRequests />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Floating chatbot */}
      <HealthChatbotLite
        brand="NutriBridge"
        accent="#7ce2a1"
        side="right"
        optionPalette={["#7ce2a1", "#4ad6ff", "#ffd166", "#ff7a7a"]}
      />

      <footer style={{ borderTop: "1px solid #1b2533", color: "#a6b0bf", background: "#0b0f14" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 16px", fontSize: 14 }}>
          ©️ {new Date().getFullYear()} NutriBridge · General guidance only; not medical advice.
        </div>
      </footer>
    </BrowserRouter>
  );
}

/* ===== Styles (same palette; only visual polish) ===== */
const headerStyle = {
  position: "sticky", top: 0, zIndex: 20, padding: "10px 16px",
  borderBottom: "1px solid #1b2533",
  background: "radial-gradient(1200px 600px at 10% -10%, rgba(124,226,161,.12), transparent), #0b0f14",
  color: "#e9edf3",
  backdropFilter: "saturate(120%) blur(6px)",
};
const headerInner = { maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 };
const brandLink = { display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" };
const brandDot = { width: 28, height: 28, borderRadius: 8, background: "#7ce2a1", display: "inline-block", boxShadow: "0 0 0 4px rgba(124,226,161,.15)" };

const mainStyle = {
  minHeight: "calc(100vh - 140px)",
  background: "radial-gradient(1200px 600px at 80% 0%, rgba(74,214,255,.10), transparent), #0b0f14",
  color: "#e9edf3",
};

const navLink = {
  color: "#c7cfdb", textDecoration: "none", padding: "6px 10px",
  border: "1px solid #223043", borderRadius: 10, background: "#11161d",
  transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
};
const subtab = { ...navLink, padding: "6px 12px" };
const activeTab = { background: "#16202c", color: "#e9edf3", borderColor: "#2a3b54", boxShadow: "0 4px 16px rgba(0,0,0,.35) inset" };
const tabHover = { cursor: "pointer" };

const pillLink = {
  textDecoration: "none", color: "#0b0f14", background: "#7ce2a1",
  padding: "10px 16px", borderRadius: 999, fontWeight: 700,
  boxShadow: "0 8px 24px rgba(124,226,161,.25)", border: "1px solid rgba(124,226,161,.45)",
  transition: "transform .15s ease, box-shadow .15s ease, filter .15s ease",
};
const pillHover = {
  filter: "saturate(110%)",
};
 /* ===== Landing section styles ===== */
const heroWrap = {
  position: "relative",
  borderRadius: 16,
  overflow: "hidden",
  maxWidth: 1120,
  margin: "0 auto",
  marginTop: 16,
  height: "56vh",
  background: "linear-gradient(180deg, rgba(0,0,0,.0), rgba(0,0,0,.3)), #10161f",
  boxShadow: "0 12px 40px rgba(0,0,0,.45)",
};
const heroImg = {
  position: "absolute",
  inset: 0,
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity: 0.35, // keep dark theme readable
};
const heroOverlay = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(900px 400px at 15% -15%, rgba(124,226,161,.20), transparent), radial-gradient(900px 400px at 85% 0%, rgba(74,214,255,.15), transparent)",
};
const heroContent = {
  position: "relative",
  zIndex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "0 16px",
};
const heroTitle = {
  fontSize: 36,
  lineHeight: 1.1,
  margin: 0,
  marginBottom: 8,
  textShadow: "0 2px 16px rgba(0,0,0,.6)",
};
const heroSub = {
  marginTop: 6,
  marginBottom: 18,
  color: "#c7cfdb",
  fontSize: 16,
};

const howWrap = {
  maxWidth: 1120,
  margin: "0 auto",
  padding: "28px 16px 16px",
};
const howTitle = {
  fontSize: 24,
  fontWeight: 800,
  margin: "18px 0 16px",
};
const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};
const howCard = {
  background: "linear-gradient(180deg, #11161d, #0f141b)",
  border: "1px solid #223043",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,.35)",
  transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
};
const howIcon = {
  width: 44, height: 44, borderRadius: 12,
  display: "grid", placeItems: "center",
  background: "rgba(124,226,161,.12)",
  border: "1px solid rgba(124,226,161,.35)",
  marginBottom: 10,
  fontSize: 22,
};
const cardTitle = { fontWeight: 700, margin: "4px 0 6px" };
const cardText  = { color: "#a6b0bf", fontSize: 14 };

/* Small interactive effects */
Object.assign(tabHover, {
  ":hover": undefined,
});