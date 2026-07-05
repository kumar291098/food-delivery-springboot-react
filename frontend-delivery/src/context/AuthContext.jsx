import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [driver, setDriver] = useState(() => {
    const saved = window.localStorage.getItem("delivery_driver");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return window.localStorage.getItem("delivery-token") || null;
  });

  useEffect(() => {
    if (driver) {
      window.localStorage.setItem("delivery_driver", JSON.stringify(driver));
    } else {
      window.localStorage.removeItem("delivery_driver");
    }
  }, [driver]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("delivery-token", token);
    } else {
      window.localStorage.removeItem("delivery-token");
    }
  }, [token]);

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const currentToken = token || window.localStorage.getItem("delivery-token");
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
    if (response.user.role !== "DELIVERY_PARTNER") {
      throw new Error("Access Denied: Only Delivery Partners can log in here.");
    }
    setToken(response.token);
    setDriver(response.user);
    return response.user;
  }

  async function register(userForm) {
    const newUser = await request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ ...userForm, role: "DELIVERY_PARTNER" })
    });
    const loginRes = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: userForm.email, password: userForm.password })
    });
    setToken(loginRes.token);
    setDriver(loginRes.user);
    return loginRes.user;
  }

  function logout() {
    setToken(null);
    setDriver(null);
    window.localStorage.removeItem("delivery_driver");
    window.localStorage.removeItem("delivery-token");
  }

  return (
    <AuthContext.Provider value={{ driver, token, login, register, logout, request }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
