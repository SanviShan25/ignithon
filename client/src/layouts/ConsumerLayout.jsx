import { Link, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useRole } from "../RoleContext";

export default function ConsumerLayout() {
  const { setRole } = useRole();
  useEffect(() => { setRole?.("consumer"); }, [setRole]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <Link to="/" className="text-2xl font-bold">FoodLink</Link>
        <nav style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Link to="/consumer/discover">Discover</Link>
          <Link to="/consumer/requests">My Requests</Link>

          {/* 🔗 open donor in NEW TAB */}
          <a
            href="/donor/add"
            target="_blank"
            rel="noopener"
            onClick={() => localStorage.setItem("role","donor")}
          >
            Switch to Donor
          </a>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}