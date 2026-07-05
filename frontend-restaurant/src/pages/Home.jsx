import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BellRing,
  ChefHat,
  Clock3,
  ExternalLink,
  IndianRupee,
  MapPin,
  Phone,
  ReceiptText,
  Store,
  UserRound
} from "lucide-react";

export default function Home({
  selectedRestaurant,
  setSelectedRestaurant,
  orders,
  setOrders,
  loadOrders,
  toast,
  setToast,
  error,
  setError
}) {
  const { owner, request } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newMenuForm, setNewMenuForm] = useState({ name: "", description: "", price: "" });
  const [restaurantRegisterForm, setRestaurantRegisterForm] = useState({
    name: "",
    cuisine: "",
    address: "",
    phoneNumber: ""
  });

  useEffect(() => {
    if (owner?.email) {
      loadOwnerRestaurant(owner.email);
    }
  }, [owner]);

  async function loadOwnerRestaurant(email) {
    setLoading(true);
    try {
      const rest = await request(`/api/restaurants/owner/${email}`);
      setSelectedRestaurant(rest);
    } catch (err) {
      setSelectedRestaurant(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestaurantRegister(e) {
    e.preventDefault();
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

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  }

  // Filter orders related to the selected restaurant
  const restaurantOrders = useMemo(
    () => orders.filter((order) => order.restaurantId === selectedRestaurant?.id),
    [orders, selectedRestaurant]
  );

  const pendingOrders = useMemo(
    () => restaurantOrders.filter((o) => o.status === "PENDING" || o.status === "ACCEPTED"),
    [restaurantOrders]
  );
  const preparingOrders = useMemo(
    () => restaurantOrders.filter((o) => o.status === "PREPARING"),
    [restaurantOrders]
  );
  const dispatchedOrders = useMemo(
    () =>
      restaurantOrders.filter(
        (o) =>
          o.status === "SEARCHING_FOR_DELIVERY_PARTNER" ||
          o.status === "OUT_FOR_DELIVERY" ||
          o.status === "DELIVERED"
      ),
    [restaurantOrders]
  );

  if (!selectedRestaurant) {
    return (
      <section className="panel" style={{ padding: "30px", maxWidth: "600px", margin: "40px auto" }}>
        <div className="panel-heading">
          <h2>Register Your Restaurant</h2>
        </div>
        <form className="account-form" onSubmit={handleRestaurantRegister}>
          <div className="form-grid">
            <label className="wide-field">
              <span>Restaurant Name</span>
              <input
                value={restaurantRegisterForm.name}
                onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Cuisine Type</span>
              <input
                placeholder="e.g. Indian, Chinese"
                value={restaurantRegisterForm.cuisine}
                onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, cuisine: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                value={restaurantRegisterForm.phoneNumber}
                onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, phoneNumber: e.target.value })}
                required
              />
            </label>
            <label className="wide-field">
              <span>Address</span>
              <input
                value={restaurantRegisterForm.address}
                onChange={(e) => setRestaurantRegisterForm({ ...restaurantRegisterForm, address: e.target.value })}
                required
              />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "16px", background: "linear-gradient(135deg, #ff8b37, #9b51e0)" }}>
            {loading ? "Registering..." : "Create Restaurant Profile"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <>
      {/* Left column - Restaurant info */}
      <div className="stack">
        <section className="panel">
          <div className="panel-heading">
            <h2>Store Profile</h2>
          </div>
          <div className="customer-card">
            <div className="avatar" style={{ background: "rgba(155, 81, 224, 0.1)", color: "#9b51e0" }}>
              <Store size={22} />
            </div>
            <div className="customer-info">
              <strong>{selectedRestaurant.name}</strong>
              <span>{selectedRestaurant.cuisine} Cuisine</span>
              <span>{selectedRestaurant.phoneNumber}</span>
              <span>{selectedRestaurant.address}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Center column - Active order processing board */}
      <div className="stack wide-stack">
        <section className="panel">
          <div className="panel-heading">
            <h2>Active Order Queue</h2>
            <span className="cart-badge">{restaurantOrders.length} Total</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", padding: "16px" }}>
            {/* New / Accepted Column */}
            <div>
              <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px", fontSize: "14px", color: "#475569" }}>
                <BellRing size={16} /> New & Accepted ({pendingOrders.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingOrders.map((o) => (
                  <div key={o.orderId} style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>#{o.orderId}</strong>
                      <span style={{ fontSize: "12px", background: "#fee2e2", color: "#ef4444", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>{o.status}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                      {o.items.map((i) => `${i.quantity}x MenuItem #${i.menuItemId}`).join(", ")}
                    </div>
                    {o.status === "PENDING" ? (
                      <button className="primary-button" style={{ width: "100%", padding: "6px", fontSize: "12px", background: "#10b981" }} onClick={() => handleUpdateStatus(o.orderId, "ACCEPTED")}>
                        Accept Order
                      </button>
                    ) : (
                      <button className="primary-button" style={{ width: "100%", padding: "6px", fontSize: "12px", background: "#f59e0b" }} onClick={() => handleUpdateStatus(o.orderId, "PREPARING")}>
                        Start Preparing
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Column */}
            <div>
              <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px", fontSize: "14px", color: "#475569" }}>
                <ChefHat size={16} /> Kitchen Preparing ({preparingOrders.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {preparingOrders.map((o) => (
                  <div key={o.orderId} style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>#{o.orderId}</strong>
                      <span style={{ fontSize: "12px", background: "#fef3c7", color: "#d97706", padding: "2px 6px", borderRadius: "4px" }}>PREPARING</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                      {o.items.map((i) => `${i.quantity}x MenuItem #${i.menuItemId}`).join(", ")}
                    </div>
                    <button className="primary-button" style={{ width: "100%", padding: "6px", fontSize: "12px", background: "#3b82f6" }} onClick={() => handleUpdateStatus(o.orderId, "SEARCHING_FOR_DELIVERY_PARTNER")}>
                      Ready for Dispatch
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Column */}
            <div>
              <h3 style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px", fontSize: "14px", color: "#475569" }}>
                <Clock3 size={16} /> Out & Delivered ({dispatchedOrders.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {dispatchedOrders.map((o) => (
                  <div key={o.orderId} style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>#{o.orderId}</strong>
                      <span style={{ fontSize: "11px", background: "#d1fae5", color: "#059669", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>{o.status.replace(/_/g, " ")}</span>
                    </div>
                    <span style={{ display: "block", fontSize: "12px", color: "#475569" }}>Total: {currency(o.totalAmount)}</span>
                    {o.driverName && <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Driver: {o.driverName}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right column - Menu list & Menu Item Editor */}
      <div className="stack">
        <section className="panel">
          <div className="panel-heading">
            <h2>Manage Menu</h2>
          </div>

          <form style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.08)" }} onSubmit={handleAddMenuItem}>
            <span className="eyebrow" style={{ marginBottom: "8px" }}>Add New Dish</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                placeholder="Dish Name"
                value={newMenuForm.name}
                onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                required
              />
              <input
                placeholder="Price (INR)"
                type="number"
                value={newMenuForm.price}
                onChange={(e) => setNewMenuForm({ ...newMenuForm, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                rows="2"
                value={newMenuForm.description}
                onChange={(e) => setNewMenuForm({ ...newMenuForm, description: e.target.value })}
                required
              />
              <button className="primary-button" type="submit" style={{ background: "#9b51e0", justifyContent: "center" }}>
                Add to Menu
              </button>
            </div>
          </form>

          <div style={{ padding: "16px" }}>
            <span className="eyebrow" style={{ marginBottom: "8px" }}>Current Menu</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
              {selectedRestaurant.menuItems?.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.01)", border: "1px solid rgba(0,0,0,0.05)", padding: "8px", borderRadius: "6px" }}>
                  <div>
                    <strong>{m.name}</strong>
                    <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{m.description}</span>
                  </div>
                  <strong>{currency(m.price)}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
