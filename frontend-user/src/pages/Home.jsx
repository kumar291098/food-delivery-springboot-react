import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { MapPin, Phone, Star, IndianRupee, ShoppingBag } from "lucide-react";
import OrderTracker from "../components/OrderTracker";

const restaurantVisuals = {
  "Spice Garden":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
  "Urban Bowl":
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"
};

const paymentOptions = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "UPI", label: "UPI" },
  { value: "WALLET", label: "Wallet" }
];

const initialPaymentForm = {
  paymentMethod: "CREDIT_CARD",
  cardholderName: "Avi Sharma",
  cardNumber: "4111111111111111",
  expiryDate: "12/28",
  cvv: "123",
  instructions: "Leave at the lobby desk"
};

export default function Home() {
  const { customer, request } = useAuth();
  const {
    cart,
    selectedRestaurantId,
    setSelectedRestaurantId,
    cartSubtotal,
    deliveryFee,
    taxes,
    grandTotal,
    addToCart,
    changeQuantity,
    clearCart
  } = useCart();

  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  function currency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value ?? 0);
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (customer?.id) {
      loadActiveOrder(customer.id);
    }
  }, [customer]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0] || null,
    [restaurants, selectedRestaurantId]
  );

  useEffect(() => {
    if (!selectedRestaurantId && restaurants.length > 0) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  async function loadRestaurants() {
    setLoadingRestaurants(true);
    setError("");
    try {
      const data = await request("/api/restaurants");
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRestaurants(false);
    }
  }

  async function loadActiveOrder(userId) {
    try {
      const orders = await request(`/api/orders/user/${userId}`);
      const active = orders.find(
        (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
      );
      if (active) {
        setActiveOrder({
          orderId: active.orderId,
          status: active.status,
          total: active.totalAmount
        });
      } else {
        setActiveOrder(null);
      }
    } catch (err) {
      console.error("Failed to load active orders:", err);
    }
  }

  function updatePaymentForm(e) {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (!customer?.id) {
      setError("Please log in first.");
      return;
    }
    if (!selectedRestaurant || cart.length === 0) {
      setError("Add at least one dish to the cart.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const order = await request("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          userId: customer.id,
          restaurantId: selectedRestaurant.id,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity
          })),
          deliveryAddress: customer.address,
          instructions: paymentForm.instructions,
          customerEmail: customer.email,
          customerPhoneNumber: customer.phoneNumber
        })
      });

      const payment = await request("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          orderId: Number(order.orderId),
          userId: customer.id,
          amount: grandTotal,
          paymentMethod: paymentForm.paymentMethod,
          cardholderName: paymentForm.cardholderName,
          cardNumber: paymentForm.cardNumber,
          expiryDate: paymentForm.expiryDate,
          cvv: paymentForm.cvv
        })
      });

      let orderStatus = order.status;
      if (payment.status === "SUCCESS") {
        const updatedOrder = await request(`/api/orders/${order.orderId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: "ACCEPTED" })
        });
        orderStatus = updatedOrder.status;
      }

      setActiveOrder({
        orderId: Number(order.orderId),
        status: orderStatus,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        total: grandTotal
      });
      clearCart();
      setToast("Order placed and payment received.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="dashboard-grid">
      {/* Left column - Customer details & Active order tracker */}
      <div className="stack">
        {customer && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Customer Account</span>
                <h2>User Profile</h2>
              </div>
            </div>
            <div className="customer-card">
              <div className="avatar" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Star size={16} />
              </div>
              <div className="customer-info">
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
                <span>{customer.email}</span>
                <span>{customer.phoneNumber}</span>
                <span>{customer.address}</span>
              </div>
            </div>
          </section>
        )}

        {activeOrder && (
          <OrderTracker
            activeOrder={activeOrder}
            setActiveOrder={setActiveOrder}
            setToast={setToast}
            setError={setError}
          />
        )}
      </div>

      {/* Center column - Menu Catalog */}
      <div className="stack wide-stack">
        <section className="hero-strip">
          {selectedRestaurant && (
            <>
              <img
                src={restaurantVisuals[selectedRestaurant.name] || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"}
                alt={selectedRestaurant.name}
                className="hero-image"
              />
              <div className="hero-content">
                <span className="eyebrow">Now Ordering From</span>
                <h2>{selectedRestaurant.name}</h2>
                <div className="hero-meta">
                  <span>
                    <MapPin size={15} />
                    {selectedRestaurant.address}
                  </span>
                  <span>
                    <Phone size={15} />
                    {selectedRestaurant.phoneNumber}
                  </span>
                  <span>
                    <Star size={15} />
                    {selectedRestaurant.rating?.toFixed(1)} Rating
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Select Restaurant</h2>
          </div>

          {loadingRestaurants ? (
            <div className="empty-state">Loading restaurants...</div>
          ) : (
            <div className="restaurant-page-grid">
              <div className="restaurant-list">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    className={`restaurant-tile ${
                      selectedRestaurant?.id === restaurant.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedRestaurantId(restaurant.id)}
                  >
                    <img
                      src={restaurantVisuals[restaurant.name] || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"}
                      alt={restaurant.name}
                      className="restaurant-image"
                    />
                    <div className="restaurant-copy">
                      <div className="tile-header">
                        <strong>{restaurant.name}</strong>
                        <span className="rating-chip">
                          <Star size={12} />
                          {restaurant.rating}
                        </span>
                      </div>
                      <span>{restaurant.cuisine}</span>
                      <span>{restaurant.address}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Restaurant Menu Items */}
              <div className="menu-grid">
                <span className="eyebrow">Menu Items</span>
                {selectedRestaurant?.menuItems?.map((menuItem) => (
                  <div key={menuItem.id} className="menu-item">
                    <div className="menu-copy">
                      <strong>{menuItem.name}</strong>
                      <p>{menuItem.description}</p>
                    </div>
                    <div className="menu-actions">
                      <span className="price-tag">
                        <IndianRupee size={15} />
                        {menuItem.price}
                      </span>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => addToCart(menuItem, selectedRestaurant)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Right column - Cart and Checkout */}
      <div className="stack">
        <section className="panel">
          <div className="panel-heading">
            <h2>Your Cart</h2>
            <span className="cart-badge">{cart.length} Items</span>
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">Cart is empty. Add dishes to order.</div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span style={{ display: "block" }}>{currency(item.price)}</span>
                  </div>
                  <div className="qty-controls">
                    <button type="button" onClick={() => changeQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => changeQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}

              <div className="summary-list">
                <div>
                  <span>Subtotal</span>
                  <strong>{currency(cartSubtotal)}</strong>
                </div>
                <div>
                  <span>Delivery Charge</span>
                  <span>{currency(deliveryFee)}</span>
                </div>
                <div>
                  <span>GST (5%)</span>
                  <span>{currency(taxes)}</span>
                </div>
                <div className="summary-total">
                  <strong>Grand Total</strong>
                  <strong>{currency(grandTotal)}</strong>
                </div>
              </div>

              {/* Checkout forms */}
              <form className="checkout-form" onSubmit={handleCheckout}>
                <span className="eyebrow" style={{ marginTop: "12px" }}>Payment Details</span>
                <div className="form-grid">
                  <label>
                    <span>Payment Method</span>
                    <select
                      name="paymentMethod"
                      value={paymentForm.paymentMethod}
                      onChange={updatePaymentForm}
                    >
                      {paymentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Cardholder Name</span>
                    <input
                      name="cardholderName"
                      value={paymentForm.cardholderName}
                      onChange={updatePaymentForm}
                      required
                    />
                  </label>

                  <label>
                    <span>Card Number</span>
                    <input
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={updatePaymentForm}
                      required
                    />
                  </label>

                  <div className="form-grid two-up">
                    <label>
                      <span>Expiry Date</span>
                      <input
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={updatePaymentForm}
                        required
                      />
                    </label>
                    <label>
                      <span>CVV</span>
                      <input
                        name="cvv"
                        type="password"
                        maxLength="3"
                        value={paymentForm.cvv}
                        onChange={updatePaymentForm}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    <span>Delivery Instructions</span>
                    <textarea
                      name="instructions"
                      rows="2"
                      value={paymentForm.instructions}
                      onChange={updatePaymentForm}
                    />
                  </label>
                </div>

                <button className="primary-button" type="submit" disabled={submitting}>
                  {submitting ? "Processing Payment..." : `Pay & Place Order`}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {error && <div className="toast error">{error}</div>}
    </main>
  );
}
