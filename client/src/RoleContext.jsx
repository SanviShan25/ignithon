import { createContext, useContext, useEffect, useState } from "react";

const RoleContext = createContext({ role: "", setRole: () => {} });

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  useEffect(() => {
    localStorage.setItem("role", role || "");
  }, [role]);
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);