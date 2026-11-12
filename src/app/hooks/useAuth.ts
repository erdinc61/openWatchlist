"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = () => {
    if (password === "asdf") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      setError(false);
      return true;
    } else {
      setError(true);
      setPassword("");
      return false;
    }
  };

  return {
    isAuthenticated,
    password,
    setPassword,
    error,
    handlePasswordSubmit,
  };
}
