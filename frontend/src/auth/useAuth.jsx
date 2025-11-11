import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
    const idToken = localStorage.getItem("id_token");
    const accessToken = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const email = localStorage.getItem("user_email");

    if (!idToken) return null;
    return { idToken, accessToken, email, role };
  });


  const login = (token, email, role) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_role", role);

    setUser({ token, email, role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
