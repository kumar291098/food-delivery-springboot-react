import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function OrderHistory() {
  const { request, customer } = useAuth();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  }

  useEffect(() => {
    if (customer?.id) {
      loadHistory();
    }
  }, [customer]);

  async function loadHistory() {
    try {
      const orders = await request(`/api/orders/user/${customer.id}`);
      setOrderHistory(orders);
    } catch (e) {
      console.error("Failed to load order history", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="empty-state">Loading order history...</div>;
  }

  return (
    <section className="panel" style={{ maxWidth: "800px", margin: "24px auto" }}>
      <div className="panel-heading">
        <h2>Order History</h2>
      </div>
      {orderHistory.length === 0 ? (
        <div className="empty-state">No orders placed yet.</div>
      ) : (
        <div className="history-list">
          {orderHistory.map((item) => (
            <div key={item.orderId} className="history-row">
              <div className="history-main">
                <strong>Order #{item.orderId}</strong>
                <span>Total: {currency(item.totalAmount)}</span>
              </div>
              <div className="history-side">
                <span className="status-pill success">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
