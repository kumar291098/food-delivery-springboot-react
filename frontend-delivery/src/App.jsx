import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {
  const { driver } = useAuth();
  if (!driver) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout({ children, loadOrders }) {
  return (
    <div className="app-shell">
      <Navbar loadOrders={loadOrders} />
      <main className="dashboard-grid" style={{ gridTemplateColumns: "280px 1fr 340px" }}>
        {children}
      </main>
    </div>
  );
}

function AppContent() {
  const { driver, request } = useAuth();
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!driver) return;
    loadOrders();
    // Poll orders silently in the background every 5 seconds
    const interval = setInterval(async () => {
      try {
        const orderData = await request("/api/orders");
        setOrders(orderData);
      } catch (err) {
        console.error("Failed silently to poll orders:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [driver]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadOrders() {
    try {
      const orderData = await request("/api/orders");
      setOrders(orderData);
      setToast("Orders refreshed.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout loadOrders={loadOrders}>
                <Home
                  orders={orders}
                  loadOrders={loadOrders}
                  toast={toast}
                  setToast={setToast}
                  error={error}
                  setError={setError}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast && <div className="toast">{toast}</div>}
      {error && <div className="toast error">{error}</div>}
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
