import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { MapPin, Phone, ReceiptText } from "lucide-react";

export default function Home({
  orders,
  loadOrders,
  setToast,
  setError
}) {
  const { driver, request } = useAuth();

  async function handleClaimOrder(order) {
    if (!driver) return;
    try {
      await request(`/api/orders/${order.id || order.orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "OUT_FOR_DELIVERY",
          driverEmail: driver.email,
          driverName: `${driver.firstName} ${driver.lastName}`
        })
      });
      setToast(`Delivery assigned: Order #${order.id || order.orderId}.`);
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

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  }

  const availableOrders = useMemo(
    () => orders.filter((o) => o.status === "SEARCHING_FOR_DELIVERY_PARTNER"),
    [orders]
  );
  
  const completedOrders = useMemo(
    () => orders.filter((o) => o.driverEmail === driver?.email && o.status === "DELIVERED"),
    [orders, driver]
  );

  const activeDeliveries = useMemo(
    () => orders.filter((o) => o.driverEmail === driver?.email && o.status === "OUT_FOR_DELIVERY"),
    [orders, driver]
  );

  return (
    <>
      {/* Left column - Rider details */}
      <div className="stack">
        {driver && (
          <section className="panel">
            <div className="panel-heading">
              <h2>Rider Profile</h2>
            </div>
            <div className="customer-card">
              <div className="avatar" style={{ background: "rgba(16, 172, 132, 0.1)", color: "#10ac84" }}>
                <MapPin size={22} />
              </div>
              <div className="customer-info">
                <strong>{driver.firstName} {driver.lastName}</strong>
                <span>{driver.email}</span>
                <span>{driver.phoneNumber}</span>
                <span>{driver.address}</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Center column - Active delivery tasks & Pool */}
      <div className="stack wide-stack">
        {/* Active Deliveries */}
        <section className="panel">
          <div className="panel-heading">
            <h2>Active Deliveries</h2>
            <span className="cart-badge" style={{ background: "#10ac84" }}>{activeDeliveries.length} Active</span>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="empty-state">No active deliveries. Claim an order below.</div>
          ) : (
            <div className="history-list" style={{ padding: "16px" }}>
              {activeDeliveries.map((o) => (
                <div key={o.id || o.orderId} style={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "16px", background: "rgba(16, 172, 132, 0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <strong>Order #{o.id || o.orderId}</strong>
                    <span style={{ fontSize: "12px", background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "4px" }}>IN TRANSIT</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px", fontSize: "13px" }}>
                    <div>
                      <span className="eyebrow">Delivery Address</span>
                      <strong>{o.deliveryAddress}</strong>
                    </div>
                    <div>
                      <span className="eyebrow">Customer Contact</span>
                      <span>{o.customerPhoneNumber}</span>
                    </div>
                  </div>

                  {o.instructions && (
                    <div style={{ background: "rgba(0,0,0,0.02)", padding: "8px 12px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px", color: "#475569" }}>
                      <strong>Note:</strong> {o.instructions}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button className="primary-button" style={{ flex: 1, background: "#10ac84", justifyContent: "center" }} onClick={() => handleCompleteDelivery(o.id || o.orderId)}>
                      Mark Delivered
                    </button>
                    <button className="primary-button" style={{ background: "#ef4444", justifyContent: "center" }} onClick={() => handleReleaseOrder(o.id || o.orderId)}>
                      Release Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Delivery Pool */}
        <section className="panel" style={{ marginTop: "24px" }}>
          <div className="panel-heading">
            <h2>Available Deliveries</h2>
            <span className="cart-badge">{availableOrders.length} Available</span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="empty-state">No orders waiting for delivery partner.</div>
          ) : (
            <div className="history-list" style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {availableOrders.map((o) => (
                <div key={o.id || o.orderId} style={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>Order #{o.id || o.orderId}</strong>
                    <strong>{currency(o.totalAmount)}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "6px", alignItems: "center", marginBottom: "12px" }}>
                    <MapPin size={12} /> {o.deliveryAddress}
                  </div>
                  <button className="primary-button" style={{ width: "100%", background: "#10ac84", justifyContent: "center" }} onClick={() => handleClaimOrder(o)}>
                    Claim Delivery
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right column - Completed order history */}
      <div className="stack">
        <section className="panel">
          <div className="panel-heading">
            <h2>My Delivery History</h2>
          </div>
          {completedOrders.length === 0 ? (
            <div className="empty-state">No deliveries completed yet.</div>
          ) : (
            <div className="history-list" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {completedOrders.map((o) => (
                <div key={o.id || o.orderId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.01)", border: "1px solid rgba(0,0,0,0.05)", padding: "12px", borderRadius: "6px" }}>
                  <div>
                    <strong>Order #{o.id || o.orderId}</strong>
                    <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>To: {o.deliveryAddress}</span>
                  </div>
                  <span className="status-pill success" style={{ textTransform: "uppercase" }}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
