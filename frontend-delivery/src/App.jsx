import { useEffect, useState } from "react";
import {
  BellRing,
  Clock3,
  ExternalLink,
  Home,
  IndianRupee,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  Store,
  UserRound
} from "lucide-react";

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
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

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

export default function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  
  // Auth state for Delivery Partner
  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem("delivery_driver");
    return saved ? JSON.parse(saved) : null;
  });
  const [isDriverLoginMode, setIsDriverLoginMode] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: ""
  });

  useEffect(() => {
    if (driver) {
      loadOrders();
    }
  }, [driver]);

  useEffect(() => {
    if (!driver) return;

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
    setLoading(true);
    setError("");
    try {
      const orderData = await request("/api/orders");
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDriverLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await request("/api/users/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });
      if (response.user.role !== "DELIVERY_PARTNER") {
        throw new Error("Access Denied: Only Delivery Partners can log in here.");
      }
      setDriver(response.user);
      localStorage.setItem("delivery_driver", JSON.stringify(response.user));
      setToast("Logged in successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDriverRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await request("/api/users/register", {
        method: "POST",
        body: JSON.stringify({ ...registerForm, role: "DELIVERY_PARTNER" })
      });
      setDriver(response);
      localStorage.setItem("delivery_driver", JSON.stringify(response));
      setToast("Registered as Delivery Partner successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setDriver(null);
    localStorage.removeItem("delivery_driver");
    setOrders([]);
    setToast("Logged out successfully.");
  }

  async function handleClaimOrder(order) {
    if (!driver) return;
    try {
      await request(`/api/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "OUT_FOR_DELIVERY",
          driverEmail: driver.email,
          driverName: `${driver.firstName} ${driver.lastName}`
        })
      });
      setToast(`Delivery assigned: Order #${order.id}.`);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCompleteDelivery(orderId) {
    if (!driver) return;
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "DELIVERED",
          driverEmail: driver.email,
          driverName: `${driver.firstName} ${driver.lastName}`
        })
      });
      setToast(`Order #${orderId} marked as DELIVERED successfully!`);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReleaseOrder(orderId) {
    if (!driver) return;
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "SEARCHING_FOR_DELIVERY_PARTNER",
          driverEmail: null,
          driverName: null
        })
      });
      setToast(`Delivery released: Order #${orderId}.`);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  // Orders that are currently ready to be picked up by delivery drivers
  const availableOrders = orders.filter((o) => o.status === "SEARCHING_FOR_DELIVERY_PARTNER");
  
  // History of completed orders in system
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  // Active deliveries for this driver
  const activeDeliveries = orders.filter(
    (o) => o.driverEmail === driver?.email && o.status === "OUT_FOR_DELIVERY"
  );

  if (!driver) {
    return (
      <div className="app-shell" style={{ maxWidth: "500px", margin: "40px auto 0 auto" }}>
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark" style={{ background: "linear-gradient(135deg, #10ac84, #01a3a4)" }}>
              <MapPin size={24} />
            </div>
            <div>
              <span className="eyebrow">Delivery Partner Portal</span>
              <h1>Rider Dashboard</h1>
            </div>
          </div>
        </header>

        <main className="panel" style={{ padding: "30px", marginTop: "20px" }}>
          <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "4px", marginBottom: "20px" }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                background: isDriverLoginMode ? "#10ac84" : "transparent",
                color: isDriverLoginMode ? "#fff" : "#475569",
                transition: "all 0.2s"
              }}
              onClick={() => setIsDriverLoginMode(true)}
            >
              Login
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
                background: !isDriverLoginMode ? "#10ac84" : "transparent",
                color: !isDriverLoginMode ? "#fff" : "#475569",
                transition: "all 0.2s"
              }}
              onClick={() => setIsDriverLoginMode(false)}
            >
              Register Rider
            </button>
          </div>

          {isDriverLoginMode ? (
            <form className="account-form" onSubmit={handleDriverLogin}>
              <h2 style={{ marginBottom: "20px" }}>Rider Sign In</h2>
              <div className="stack" style={{ gap: "15px", marginBottom: "20px" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Email</span>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Password</span>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </label>
              </div>
              <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px", background: "#10ac84" }}>
                Sign In
              </button>
            </form>
          ) : (
            <form className="account-form" onSubmit={handleDriverRegister}>
              <h2 style={{ marginBottom: "20px" }}>Rider Registration</h2>
              <div className="form-grid two-up" style={{ marginBottom: "20px" }}>
                <label>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>First Name</span>
                  <input
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Last Name</span>
                  <input
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    required
                  />
                </label>
                <label className="wide-field">
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Email</span>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Password</span>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </label>
                <label>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Phone Number</span>
                  <input
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    required
                  />
                </label>
                <label className="wide-field">
                  <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Address</span>
                  <input
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    required
                  />
                </label>
              </div>
              <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px", background: "#10ac84" }}>
                Register Account
              </button>
            </form>
          )}
        </main>
        {toast && <div className="toast">{toast}</div>}
        {error && <div className="toast error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ background: "linear-gradient(135deg, #10ac84, #01a3a4)" }}>
            <MapPin size={24} />
          </div>
          <div>
            <span className="eyebrow">Delivery Partner Portal</span>
            <h1>Rider Dashboard</h1>
          </div>
        </div>

        <div className="topbar-meta">
          <button className="icon-button" onClick={loadOrders}>
            Refresh Shipments
          </button>
          <div className="metric">
            <span>Rider Name</span>
            <strong>{`${driver.firstName} ${driver.lastName}`}</strong>
          </div>
          <button className="icon-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-grid" style={{ gridTemplateColumns: "1fr 360px" }}>
        {/* Left column - Available Shipments */}
        <div className="stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Ready for Pickup</span>
                <h2>Available Deliveries</h2>
              </div>
              <span className="cart-badge">{availableOrders.length} Shipments</span>
            </div>

            {loading ? (
              <div className="empty-state">Scanning for available shipments...</div>
            ) : availableOrders.length === 0 ? (
              <div className="empty-state">No shipments ready for pickup right now. Check back soon!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {availableOrders.map((order) => (
                  <div key={order.id} className="menu-item" style={{ borderLeft: "4px solid #10ac84" }}>
                    <div className="menu-copy">
                      <strong>Order #{order.id}</strong>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={14} />
                        Destination: {order.deliveryAddress}
                      </span>
                      <span>Customer Email: {order.customerEmail}</span>
                      <span>Total Value: {currency(order.totalAmount)}</span>
                      {order.instructions && (
                        <p style={{ fontSize: "0.85rem", color: "#e74c3c" }}>
                          Instructions: "{order.instructions}"
                        </p>
                      )}
                    </div>
                    <div className="menu-actions" style={{ marginTop: "12px" }}>
                      <button
                        className="primary-button"
                        style={{ width: "100%", background: "#10ac84" }}
                        onClick={() => handleClaimOrder(order)}
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shipment History */}
          <section className="panel">
            <div className="panel-heading">
              <h2>Completed Deliveries</h2>
            </div>
            {completedOrders.length === 0 ? (
              <div className="empty-state">No completed deliveries yet.</div>
            ) : (
              <div className="restaurant-list">
                {completedOrders.map((order) => (
                  <div key={order.id} className="restaurant-tile" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="restaurant-copy" style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <span>Delivered to: {order.deliveryAddress}</span>
                        <span>Total: {currency(order.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="status-pill success">DELIVERED</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column - Active claimed deliveries list */}
        <div className="stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Active Tasks</span>
                <h2>Current Jobs</h2>
              </div>
              <span className="cart-badge">{activeDeliveries.length} Active</span>
            </div>

            {activeDeliveries.length > 0 ? (
              <div className="stack" style={{ gap: "20px" }}>
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="active-order" style={{ border: "1px solid #10ac84", background: "#f1fcf9", padding: "16px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "1.1rem" }}>
                        Order #{delivery.id}
                      </strong>
                      <span className="status-pill warning" style={{ background: "#ffeaa7", color: "#d63031", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600" }}>
                        OUT FOR DELIVERY
                      </span>
                    </div>
                    
                    <div className="stack" style={{ gap: "8px", fontSize: "0.9rem", color: "#2c3e50", marginBottom: "12px" }}>
                      <div>
                        <strong>Delivery Destination:</strong>
                        <p style={{ margin: "4px 0" }}>{delivery.deliveryAddress}</p>
                      </div>
                      
                      <div>
                        <strong>Customer Contact:</strong>
                        <p style={{ margin: "4px 0" }}>{delivery.customerPhoneNumber || "N/A"}</p>
                      </div>

                      <div>
                        <strong>Total Amount to Collect/Verify:</strong>
                        <p style={{ margin: "4px 0" }}>{currency(delivery.totalAmount)}</p>
                      </div>

                      {delivery.instructions && (
                        <div>
                          <strong>Instructions:</strong>
                          <p style={{ margin: "4px 0", fontStyle: "italic", color: "#c0392b" }}>
                            "{delivery.instructions}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <button
                        className="primary-button"
                        style={{ background: "#2ecc71", padding: "10px", fontSize: "0.9rem" }}
                        onClick={() => handleCompleteDelivery(delivery.id)}
                      >
                        Complete
                      </button>
                      <button
                        className="icon-button"
                        style={{ background: "#e74c3c", color: "#fff", padding: "10px", fontSize: "0.9rem" }}
                        onClick={() => handleReleaseOrder(delivery.id)}
                      >
                        Release
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No active job. Claim an available delivery to start.</div>
            )}
          </section>
        </div>
      </main>

      {/* Floating notifications */}
      {toast && <div className="toast">{toast}</div>}
      {error && <div className="toast error">{error}</div>}
    </div>
  );
}
