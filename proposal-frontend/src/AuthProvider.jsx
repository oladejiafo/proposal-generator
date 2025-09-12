// src/AuthProvider.jsx
import React, { useState, useEffect } from "react";
import api from "./api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      api.get("/user")
        .then(userRes => {
          return api.get("/current-organization")
            .then(orgRes => {
              setAuth({
                user: userRes.data,
                organization: orgRes.data
              });
            });
        })
        .catch(error => {
          console.error("Auth check failed:", error);
          localStorage.removeItem("authToken");
          delete api.defaults.headers.common['Authorization'];
          setAuth(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 🔑 Logout function
  const logout = async () => {
    try {
      await api.post("/logout"); // Laravel endpoint
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common['Authorization'];
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
