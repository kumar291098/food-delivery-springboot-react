import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(() => {
    const saved = window.localStorage.getItem("foodflow-restaurant-owner");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return window.localStorage.getItem("foodflow-restaurant-token") || null;
  });

  useEffect(() => {
    if (owner) {
      window.localStorage.setItem("foodflow-restaurant-owner", JSON.stringify(owner));
    } else {
      window.localStorage.removeItem("foodflow-restaurant-owner");
    }
  }, [owner]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("foodflow-restaurant-token", token);
    } else {
      window.localStorage.removeItem("foodflow-restaurant-token");
    }
  }, [token]);

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const currentToken = token || window.localStorage.getItem("foodflow-restaurant-token");
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const response = await fetch(path, {
      ...options,
      headers
    });

    if (!response.ok) {
      let message = "Request failed";
      try {
        const body = await response.json();
        message = body.message || body.error || JSON.stringify(body);
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function login(email, password) {
    const response = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (response.user.role !== "RESTAURANT_OWNER") {
      throw new Error("Access Denied: Only Restaurant Owners can log in here.");
    }
    setToken(response.token);
    setOwner(response.user);
    return response.user;
  }

  async function register(userForm) {
    const newUser = await request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ ...userForm, role: "RESTAURANT_OWNER" })
    });
    const loginRes = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: userForm.email, password: userForm.password })
    });
    setToken(loginRes.token);
    setOwner(loginRes.user);
    return loginRes.user;
  }

  function logout() {
    setToken(null);
    setOwner(null);
    window.localStorage.removeItem("foodflow-restaurant-owner");
    window.localStorage.removeItem("foodflow-restaurant-token");
  }

  return (
    <AuthContext.Provider value={{ owner, token, login, register, logout, request }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
