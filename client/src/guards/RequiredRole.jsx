// src/guards/RequireRole.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function RequireRole({ role }) {
  const current = localStorage.getItem("role") || "";
  // agar role set hai aur dusre portal me ghus rahe ho to landing pe bhej do
  if (current && current !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}