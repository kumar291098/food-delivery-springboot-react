import { useEffect, useState } from "react";
import {
  BellRing,
  ChefHat,
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
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [newMenuForm, setNewMenuForm] = useState({ name: "", description: "", price: "" });

  const [owner, setOwner] = useState(() => {
    const saved = window.localStorage.getItem("foodflow-restaurant-owner");
    return saved ? JSON.parse(saved) : null;
  });
  const [ownerRegisterForm, setOwnerRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: ""
  });
  const [ownerLoginForm, setOwnerLoginForm] = useState({ email: "", password: "" });
  const [isOwnerLoginMode, setIsOwnerLoginMode] = useState(true);
  const [restaurantRegisterForm, setRestaurantRegisterForm] = useState({
    name: "",
    cuisine: "",
    address: "",
    phoneNumber: ""
  });

  useEffect(() => {
    if (!owner) return;
    window.localStorage.setItem("foodflow-restaurant-owner", JSON.stringify(owner));
    loadOwnerData(owner.email);
  }, [owner]);

  useEffect(() => {
    if (!owner) return;
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
  }, [owner]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadOwnerData(email) {
    setLoading(true);
    setError("");
    try {
      const orderData = await request("/api/orders");
      setOrders(orderData);
      try {
        const rest = await request(`/api/restaurants/owner/${email}`);
        setSelectedRestaurant(rest);
      } catch (err) {
        setSelectedRestaurant(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOwnerRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await request("/api/users/register", {
        method: "POST",
        body: JSON.stringify({ ...ownerRegisterForm, role: "RESTAURANT_OWNER" })
      });
      setOwner(response);
      setToast("Registered as Restaurant Owner successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOwnerLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await request("/api/users/login", {
        method: "POST",
        body: JSON.stringify(ownerLoginForm)
      });
      if (response.user.role !== "RESTAURANT_OWNER") {
        throw new Error("Access Denied: Only Restaurant Owners can log in here.");
      }
      setOwner(response.user);
      setToast("Logged in successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestaurantRegister(e) {
    e.preventDefault();
    if (!owner) return;
    setLoading(true);
    setError("");
    try {
      const rest = await request("/api/restaurants", {
        method: "POST",
        body: JSON.stringify({
          ...restaurantRegisterForm,
          ownerEmail: owner.email,
          rating: 4.5,
          menuItems: []
        })
      });
      setSelectedRestaurant(rest);
      setToast("Restaurant registered successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("foodflow-restaurant-owner");
    setOwner(null);
    setSelectedRestaurant(null);
    setOrders([]);
  }

  async function loadOrders() {
    try {
      const orderData = await request("/api/orders");
      setOrders(orderData);
      setToast("Orders list refreshed.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateStatus(orderId, nextStatus) {
    try {
      await request(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus })
      });
      setToast(`Order #${orderId} status updated to ${nextStatus}.`);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  // Filter orders related to the selected restaurant
  const restaurantOrders = orders.filter(
    (order) => order.restaurantId === selectedRestaurant?.id
  );

  const pendingOrders = restaurantOrders.filter(
    (o) => o.status === "PENDING" || o.status === "ACCEPTED"
  );
  const preparingOrders = restaurantOrders.filter((o) => o.status === "PREPARING");
  const dispatchedOrders = restaurantOrders.filter(
    (o) => o.status === "SEARCHING_FOR_DELIVERY_PARTNER" || o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED"
  );

  async function handleAddMenuItem(event) {
    event.preventDefault();
    if (!selectedRestaurant) return;
    try {
      const newItem = await request(`/api/restaurants/${selectedRestaurant.id}/menu`, {
        method: "POST",
        body: JSON.stringify({
          name: newMenuForm.name,
          description: newMenuForm.description,
          price: Number(newMenuForm.price),
          available: true
        })
      });
      setSelectedRestaurant((curr) => ({
        ...curr,
        menuItems: [...(curr.menuItems || []), newItem]
      }));
      setNewMenuForm({ name: "", description: "", price: "" });
      setToast("Menu item added successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ background: "linear-gradient(135deg, #ff8b37, #9b51e0)" }}>
            <Store size={24} />
          </div>
          <div>
            <span className="eyebrow">Restaurant Portal</span>
            <h1>Merchant Center</h1>
          </div>
        </div>

        <div className="topbar-meta">
          {owner && (
            <>
              <div className="metric">
                <span>Merchant Account</span>
                <strong>{owner.firstName}</strong>
              </div>
              <button className="icon-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          {owner && (
            <button className="icon-button" onClick={loadOrders}>
              Refresh Orders
            </button>
          )}
          {selectedRestaurant && (
            <div className="metric wide">
              <span>Managing Store</span>
              <strong>{selectedRestaurant.name}</strong>
            </div>
          )}
        </div>
      </header>

      <main className={owner && selectedRestaurant ? "dashboard-grid" : ""} style={owner && selectedRestaurant ? { gridTemplateColumns: "280px 1fr 340px" } : { padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        {!owner ? (
          <section className="panel" style={{ padding: "30px" }}>
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
                  background: isOwnerLoginMode ? "#ff8b37" : "transparent",
                  color: isOwnerLoginMode ? "#fff" : "#475569",
                  transition: "all 0.2s"
                }}
                onClick={() => setIsOwnerLoginMode(true)}
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
                  background: !isOwnerLoginMode ? "#ff8b37" : "transparent",
                  color: !isOwnerLoginMode ? "#fff" : "#475569",
                  transition: "all 0.2s"
                }}
                onClick={() => setIsOwnerLoginMode(false)}
              >
                Register Owner
              </button>
            </div>

            {isOwnerLoginMode ? (
              <form className="account-form" onSubmit={handleOwnerLogin}>
                <h2 style={{ marginBottom: "20px" }}>Merchant Sign In</h2>
                <div className="stack" style={{ gap: "15px", marginBottom: "20px" }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Email</span>
                    <input
                      type="email"
                      value={ownerLoginForm.email}
                      onChange={(e) => setOwnerLoginForm({ ...ownerLoginForm, email: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Password</span>
                    <input
                      type="password"
                      value={ownerLoginForm.password}
                      onChange={(e) => setOwnerLoginForm({ ...ownerLoginForm, password: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                </div>
                <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px" }}>
                  Sign In
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleOwnerRegister}>
                <h2 style={{ marginBottom: "20px" }}>Merchant Account Registration</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <label>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>First Name</span>
                    <input
                      value={ownerRegisterForm.firstName}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, firstName: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Last Name</span>
                    <input
                      value={ownerRegisterForm.lastName}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, lastName: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label style={{ gridColumn: "span 2" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Email</span>
                    <input
                      type="email"
                      value={ownerRegisterForm.email}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, email: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Password</span>
                    <input
                      type="password"
                      value={ownerRegisterForm.password}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, password: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Phone Number</span>
                    <input
                      value={ownerRegisterForm.phoneNumber}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, phoneNumber: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                  <label style={{ gridColumn: "span 2" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Address</span>
                    <input
                      value={ownerRegisterForm.address}
                      onChange={(e) => setOwnerRegisterForm({ ...ownerRegisterForm, address: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                  </label>
                </div>
                <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px" }}>
                  Register Account
                </button>
              </form>
            )}
          </section>
        ) : !selectedRestaurant ? (
          <section className="panel" style={{ padding: "30px" }}>
            <form className="account-form" onSubmit={handleRestaurantRegister}>
              <h2 style={{ marginBottom: "20px" }}>Register Your Restaurant</h2>
              <div className="stack" style={{ gap: "15px", marginBottom: "20px" }}>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Restaurant Name</span>
                  <input
                    value={restaurantRegisterForm.name}
                    onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, name: e.target.value })}
                    required
                    placeholder="e.g. Pizza Paradise"
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Cuisine Type</span>
                  <input
                    value={restaurantRegisterForm.cuisine}
                    onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, cuisine: e.target.value })}
                    required
                    placeholder="e.g. Italian, Fast Food"
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Address</span>
                  <input
                    value={restaurantRegisterForm.address}
                    onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, address: e.target.value })}
                    required
                    placeholder="e.g. 123 Main Street"
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Phone Number</span>
                  <input
                    value={restaurantRegisterForm.phoneNumber}
                    onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, phoneNumber: e.target.value })}
                    required
                    placeholder="e.g. +91 9999999999"
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                  />
                </label>
              </div>
              <button className="primary-button" type="submit" style={{ width: "100%", padding: "12px" }}>
                Register Restaurant
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* Left column - Restaurant info */}
            <section className="panel">
              <div className="panel-heading">
                <h2>Your Restaurant</h2>
              </div>
              <div className="restaurant-tile selected" style={{ gridTemplateColumns: "1fr" }}>
                <div className="restaurant-copy">
                  <strong style={{ fontSize: "18px" }}>{selectedRestaurant.name}</strong>
                  <span style={{ marginTop: "6px" }}>Cuisine: {selectedRestaurant.cuisine}</span>
                  <span>Address: {selectedRestaurant.address}</span>
                  <span>Phone: {selectedRestaurant.phoneNumber}</span>
                  <span>Rating: {selectedRestaurant.rating} ⭐</span>
                </div>
              </div>
            </section>

            {/* Center column - Incoming Orders & Status Management */}
            <div className="stack">
              {/* Incoming Orders Panel */}
              <section className="panel">
                <div className="panel-heading">
                  <h2>Active Orders Dashboard</h2>
                  <span className="cart-badge">{restaurantOrders.length} Total</span>
                </div>

                {restaurantOrders.length === 0 ? (
                  <div className="empty-state">No orders placed for this restaurant yet.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Pending / Accepted Column */}
                    <div className="stack">
                      <span className="eyebrow">Incoming & Accepted ({pendingOrders.length})</span>
                      {pendingOrders.map((order) => (
                        <div key={order.id} className="menu-item" style={{ borderLeft: "4px solid #ffaa00" }}>
                          <div className="menu-copy">
                            <strong>Order #{order.id}</strong>
                            <span>Address: {order.deliveryAddress}</span>
                            <span>Total: {currency(order.totalAmount)}</span>
                            <span>Items: {order.items?.length || 1} distinct item(s)</span>
                          </div>
                          <div className="menu-actions" style={{ marginTop: "10px" }}>
                            {order.status === "PENDING" ? (
                              <button
                                className="primary-button"
                                style={{ background: "#27ae60", width: "100%" }}
                                onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                              >
                                Accept Order
                              </button>
                            ) : (
                              <button
                                className="primary-button"
                                style={{ background: "#2980b9", width: "100%" }}
                                onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                              >
                                Start Cooking
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {pendingOrders.length === 0 && <div className="empty-state">No pending orders.</div>}
                    </div>

                    {/* Preparing Column */}
                    <div className="stack">
                      <span className="eyebrow">In Kitchen ({preparingOrders.length})</span>
                      {preparingOrders.map((order) => (
                        <div key={order.id} className="menu-item" style={{ borderLeft: "4px solid #3498db" }}>
                          <div className="menu-copy">
                            <strong>Order #{order.id}</strong>
                            <span>Address: {order.deliveryAddress}</span>
                            <span>Total: {currency(order.totalAmount)}</span>
                          </div>
                          <div className="menu-actions" style={{ marginTop: "10px" }}>
                            <button
                              className="primary-button"
                              style={{ background: "#9b51e0", width: "100%" }}
                              onClick={() => handleUpdateStatus(order.id, "SEARCHING_FOR_DELIVERY_PARTNER")}
                            >
                              Mark Ready (Find Driver)
                            </button>
                          </div>
                        </div>
                      ))}
                      {preparingOrders.length === 0 && <div className="empty-state">No cooking in progress.</div>}
                    </div>
                  </div>
                )}
              </section>

              {/* Past/Dispatched Orders */}
              <section className="panel">
                <div className="panel-heading">
                  <h2>Dispatched / Completed</h2>
                </div>
                {dispatchedOrders.length === 0 ? (
                  <div className="empty-state">No dispatched orders.</div>
                ) : (
                  <div className="restaurant-list">
                    {dispatchedOrders.map((order) => (
                      <div key={order.id} className="restaurant-tile" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="restaurant-copy" style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <strong>Order #{order.id}</strong>
                            <span>Address: {order.deliveryAddress}</span>
                            <span>Total: {currency(order.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="status-pill success">{order.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right column - Menu Editor */}
            <div className="stack">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Manage Menu</h2>
                  <span className="cart-badge">{selectedRestaurant.menuItems?.length || 0} Items</span>
                </div>

                <div className="cart-list" style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "14px" }}>
                  {selectedRestaurant.menuItems?.map((item) => (
                    <div key={item.id} className="cart-row">
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ display: "block", fontSize: "0.85rem" }}>{item.description}</span>
                      </div>
                      <strong>{currency(item.price)}</strong>
                    </div>
                  ))}
                </div>

                {/* Add menu item form */}
                <form className="checkout-form" onSubmit={handleAddMenuItem}>
                  <span className="eyebrow">Add Dish</span>
                  <div className="form-grid">
                    <label>
                      <span>Dish Name</span>
                      <input
                        value={newMenuForm.name}
                        onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea
                        value={newMenuForm.description}
                        onChange={(e) => setNewMenuForm({ ...newMenuForm, description: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      <span>Price (INR)</span>
                      <input
                        type="number"
                        value={newMenuForm.price}
                        onChange={(e) => setNewMenuForm({ ...newMenuForm, price: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                  <button className="primary-button" type="submit" style={{ width: "100%", marginTop: "10px" }}>
                    Add to Menu
                  </button>
                </form>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Floating notifications */}
      {toast && <div className="toast">{toast}</div>}
      {error && <div className="toast error">{error}</div>}
    </div>
  );
}
