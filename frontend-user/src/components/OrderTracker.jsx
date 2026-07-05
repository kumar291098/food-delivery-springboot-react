import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function OrderTracker({ activeOrder, setActiveOrder, setToast, setError }) {
  const { request, customer } = useAuth();

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  }

  useEffect(() => {
    if (!activeOrder?.orderId) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const latest = await request(`/api/orders/${activeOrder.orderId}`);
        setActiveOrder((curr) => {
          if (!curr || curr.orderId !== Number(latest.orderId)) return curr;
          if (curr.status !== latest.status) {
            return { ...curr, status: latest.status };
          }
          return curr;
        });
      } catch (err) {
        console.error("Failed to poll order status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOrder?.orderId, request]);

  async function handleRefresh() {
    try {
      const latest = await request(`/api/orders/${activeOrder.orderId}`);
      setActiveOrder((cur) => ({ ...cur, status: latest.status }));
      setToast("Order status refreshed.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="active-order">
      <span className="eyebrow">Live Order Tracking</span>
      <strong style={{ display: "block", margin: "8px 0" }}>
        Order #{activeOrder.orderId}
      </strong>
      <div className="active-order-grid">
        <span>Status:</span>
        <strong style={{ textTransform: "uppercase" }}>{activeOrder.status}</strong>
        <span>Payment:</span>
        <strong>{activeOrder.paymentStatus || "SUCCESS"}</strong>
        <span>Total:</span>
        <strong>{currency(activeOrder.total)}</strong>
      </div>
      <button
        className="icon-button"
        style={{ marginTop: "12px", width: "100%" }}
        onClick={handleRefresh}
      >
        Refresh Track Status
      </button>
    </div>
  );
}
