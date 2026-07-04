import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock3,
  CreditCard,
  ExternalLink,
  Home,
  IndianRupee,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  Star,
  Store,
  UserRound
} from "lucide-react";

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

const initialUserForm = {
  firstName: "Avi",
  lastName: "Sharma",
  email: `avi.${Date.now()}@demo.com`,
  password: "secret123",
  phoneNumber: "9876543210",
  address: "221B Residency Road, Bengaluru"
};

const initialPaymentForm = {
  paymentMethod: "CREDIT_CARD",
  cardholderName: "Avi Sharma",
  cardNumber: "4111111111111111",
  expiryDate: "12/28",
  cvv: "123",
  instructions: "Leave at the lobby desk"
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

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

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(() => {
    const saved = window.localStorage.getItem("foodflow-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [userForm, setUserForm] = useState(initialUserForm);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [orderHistory, setOrderHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  function updateLoginForm(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setRegistering(true);
    setError("");
    try {
      const response = await request("/api/users/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      });
      setCustomer(response.user);
      setToast(`Welcome back, ${response.user.firstName}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!customer?.id) {
      return;
    }
    window.localStorage.setItem("foodflow-user", JSON.stringify(customer));
    loadCustomerActivity(customer.id);
  }, [customer]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || restaurants[0] || null,
    [restaurants, selectedRestaurantId]
  );

  useEffect(() => {
    if (!selectedRestaurantId && restaurants.length > 0) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

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
            // Trigger loadCustomerActivity to update list and tracking card
            if (customer?.id) {
              loadCustomerActivity(customer.id);
            }
            return { ...curr, status: latest.status };
          }
          return curr;
        });
      } catch (err) {
        console.error("Failed to poll order status:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOrder?.orderId, customer?.id]);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = cart.length > 0 ? 39 : 0;
  const taxes = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + deliveryFee + taxes;

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

  async function loadCustomerActivity(userId) {
    try {
      const [orders, payments] = await Promise.all([
        request(`/api/orders/user/${userId}`),
        request(`/api/payments/user/${userId}`)
      ]);
      setOrderHistory(orders);
      setPaymentHistory(payments);

      // Restore active order if there is an undelivered one
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
      setError(err.message);
    }
  }

  function updateUserForm(event) {
    const { name, value } = event.target;
    setUserForm((current) => ({ ...current, [name]: value }));
  }

  function updatePaymentForm(event) {
    const { name, value } = event.target;
    setPaymentForm((current) => ({ ...current, [name]: value }));
  }

  async function handleRegister(event) {
    event.preventDefault();
    setRegistering(true);
    setError("");
    try {
      const newUser = await request("/api/users/register", {
        method: "POST",
        body: JSON.stringify(userForm)
      });
      setCustomer(newUser);
      setToast(`Welcome, ${newUser.firstName}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  }

  function addToCart(menuItem) {
    if (!selectedRestaurant) return;

    setCart((current) => {
      if (current.length > 0 && current[0].restaurantId !== selectedRestaurant.id) {
        setToast("Cart switched to the new restaurant.");
        return [
          {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            restaurantId: selectedRestaurant.id,
            restaurantName: selectedRestaurant.name
          }
        ];
      }

      const existing = current.find((item) => item.id === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          restaurantId: selectedRestaurant.id,
          restaurantName: selectedRestaurant.name
        }
      ];
    });
  }

  function changeQuantity(itemId, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  async function handleCheckout(event) {
    event.preventDefault();
    if (!customer?.id) {
      setError("Create a customer profile first.");
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

      await loadCustomerActivity(customer.id);
      setActiveOrder({
        orderId: Number(order.orderId),
        status: orderStatus,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        total: grandTotal
      });
      setCart([]);
      setToast("Order placed and payment received.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("foodflow-user");
    setCustomer(null);
    setOrderHistory([]);
    setPaymentHistory([]);
    setActiveOrder(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="eyebrow">Customer Portal</span>
            <h1>FoodFlow</h1>
          </div>
        </div>

        <div className="topbar-meta">
          {customer && (
            <>
              <div className="metric">
                <span>Logged In as</span>
                <strong>{customer.firstName}</strong>
              </div>
              <button className="icon-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left column - Customer Registration or Profile */}
        <div className="stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Customer Account</span>
                <h2>User Profile</h2>
              </div>
            </div>

            {!customer && (
              <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "4px", marginBottom: "16px" }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: !isLoginMode ? "#ff4500" : "transparent",
                    color: !isLoginMode ? "#fff" : "#475569",
                    transition: "all 0.2s"
                  }}
                  onClick={() => setIsLoginMode(false)}
                >
                  Register
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: isLoginMode ? "#ff4500" : "transparent",
                    color: isLoginMode ? "#fff" : "#475569",
                    transition: "all 0.2s"
                  }}
                  onClick={() => setIsLoginMode(true)}
                >
                  Login
                </button>
              </div>
            )}

            {customer ? (
              <div className="customer-card">
                <div className="avatar">
                  <UserRound size={22} />
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
            ) : isLoginMode ? (
              <form className="account-form" onSubmit={handleLogin}>
                <div className="form-grid">
                  <label className="wide-field" style={{ marginBottom: "12px", display: "block" }}>
                    <span>Email</span>
                    <input name="email" type="email" value={loginForm.email} onChange={updateLoginForm} required />
                  </label>
                  <label className="wide-field" style={{ marginBottom: "16px", display: "block" }}>
                    <span>Password</span>
                    <input name="password" type="password" value={loginForm.password} onChange={updateLoginForm} required />
                  </label>
                </div>
                <button className="primary-button" type="submit" disabled={registering}>
                  {registering ? "Logging in..." : "Login"}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form className="account-form" onSubmit={handleRegister}>
                <div className="form-grid two-up">
                  <label>
                    <span>First name</span>
                    <input name="firstName" value={userForm.firstName} onChange={updateUserForm} required />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input name="lastName" value={userForm.lastName} onChange={updateUserForm} required />
                  </label>
                  <label className="wide-field">
                    <span>Email</span>
                    <input name="email" type="email" value={userForm.email} onChange={updateUserForm} required />
                  </label>
                  <label>
                    <span>Password</span>
                    <input name="password" type="password" value={userForm.password} onChange={updateUserForm} required />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input name="phoneNumber" value={userForm.phoneNumber} onChange={updateUserForm} required />
                  </label>
                  <label className="wide-field">
                    <span>Address</span>
                    <input name="address" value={userForm.address} onChange={updateUserForm} required />
                  </label>
                </div>
                <button className="primary-button" type="submit" disabled={registering}>
                  {registering ? "Creating profile..." : "Create Account"}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </section>

          {/* Active order status tracking */}
          {activeOrder && (
            <div className="active-order">
              <span className="eyebrow">Live Order Tracking</span>
              <strong style={{ display: "block", margin: "8px 0" }}>
                Order #{activeOrder.orderId}
              </strong>
              <div className="active-order-grid">
                <span>Status:</span>
                <strong style={{ textTransform: "uppercase" }}>{activeOrder.status}</strong>
                <span>Payment:</span>
                <strong>{activeOrder.paymentStatus}</strong>
                <span>Total:</span>
                <strong>{currency(activeOrder.total)}</strong>
              </div>
              <button
                className="icon-button"
                style={{ marginTop: "12px", width: "100%" }}
                onClick={async () => {
                  try {
                    const latest = await request(`/api/orders/${activeOrder.orderId}`);
                    setActiveOrder((cur) => ({ ...cur, status: latest.status }));
                    setToast("Order status refreshed.");
                    if (customer) {
                      loadCustomerActivity(customer.id);
                    }
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              >
                Refresh Track Status
              </button>
            </div>
          )}

          {/* History Panel */}
          {customer && (
            <section className="panel">
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
          )}
        </div>

        {/* Center column - Menu Catalog */}
        <div className="stack wide-stack">
          <section className="hero-strip">
            {selectedRestaurant && (
              <>
                <img
                  src={restaurantVisuals[selectedRestaurant.name]}
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
              <div>
                <h2>Select Restaurant</h2>
              </div>
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
                        src={restaurantVisuals[restaurant.name]}
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
                          onClick={() => addToCart(menuItem)}
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
      </main>

      {/* Floating notifications */}
      {toast && <div className="toast">{toast}</div>}
      {error && <div className="toast error">{error}</div>}
    </div>
  );
}
