import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    const saved = window.localStorage.getItem("foodflow-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return window.localStorage.getItem("foodflow-token") || null;
  });

  useEffect(() => {
    if (customer) {
      window.localStorage.setItem("foodflow-user", JSON.stringify(customer));
    } else {
      window.localStorage.removeItem("foodflow-user");
    }
  }, [customer]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("foodflow-token", token);
    } else {
      window.localStorage.removeItem("foodflow-token");
    }
  }, [token]);

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const currentToken = token || window.localStorage.getItem("foodflow-token");
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
    setToken(response.token);
    setCustomer(response.user);
    return response.user;
  }

  async function register(userForm) {
    const newUser = await request("/api/users/register", {
      method: "POST",
      body: JSON.stringify(userForm)
    });
    // Auto login by logging in after register, or registering returning the token
    // Since our register endpoint doesn't return a token yet, we can login immediately after.
    const loginRes = await request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: userForm.email, password: userForm.password })
    });
    setToken(loginRes.token);
    setCustomer(loginRes.user);
    return loginRes.user;
  }

  function logout() {
    setToken(null);
    setCustomer(null);
    window.localStorage.removeItem("foodflow-user");
    window.localStorage.removeItem("foodflow-token");
  }

  return (
    <AuthContext.Provider value={{ customer, token, login, register, logout, request }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
