import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useRole } from "../RoleContext";

export default function DonorLayout() {
  const { setRole } = useRole();

  // lock role for this portal (safe even if guard not used)
  useEffect(() => {
    setRole?.("donor");
    localStorage.setItem("role", "donor");
  }, [setRole]);

  return (
    <div className="container" style={{ padding: "18px 0 32px" }}>
      {/* Top bar */}
      <header
        className="row"
        style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none", color: "var(--text)", fontWeight: 800, fontSize: 20 }}
        >
          NutriBridge
        </Link>

        <nav className="row" style={{ gap: 12, alignItems: "center" }}>
          <Link to="/donor/add" className="btn ghost">Add Listing</Link>
          <Link to="/donor/mine" className="btn ghost">My Listings</Link>
          <Link to="/donor/profile" className="btn ghost">Profile</Link>

          {/* 🔗 open Consumer portal in a NEW TAB */}
          <a
            href="/consumer/discover"
            target="_blank"
            rel="noopener"
            className="btn secondary"
            onClick={() => localStorage.setItem("role", "consumer")}
            title="Open consumer portal in a new tab"
          >
            Switch to Consumer
          </a>
        </nav>
      </header>

      {/* Page content */}
      <div className="card">
        <Outlet />
      </div>
    </div>
  );
}