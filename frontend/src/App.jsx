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

function ServiceCard({ icon: Icon, title, endpoint, status, summary }) {
  return (
    <div className="service-card">
      <div className="service-card-top">
        <div className="service-icon">
          <Icon size={18} />
        </div>
        <span className={`service-status ${status === "Live" ? "live" : ""}`}>{status}</span>
      </div>
      <strong>{title}</strong>
      <span>{summary}</span>
      <a href={endpoint} target="_blank" rel="noreferrer" className="service-link">
        {endpoint}
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
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
  const [lastNotification, setLastNotification] = useState(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = cart.length > 0 ? 39 : 0;
  const taxes = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + deliveryFee + taxes;
  const cuisineSummary = restaurants.map((item) => item.cuisine).join(" • ");

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
      setToast(`Welcome, ${newUser.firstName}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  }

  function addToCart(menuItem) {
    if (!selectedRestaurant) {
      return;
    }

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
          instructions: paymentForm.instructions
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

      const notification = await request("/api/notifications/order-update", {
        method: "POST",
        body: JSON.stringify({
          orderId: Number(order.orderId),
          userId: customer.id,
          customerEmail: customer.email,
          customerPhoneNumber: customer.phoneNumber,
          status: payment.status === "SUCCESS" ? "ACCEPTED" : "PAYMENT_FAILED"
        })
      });

      await loadCustomerActivity(customer.id);
      setLastNotification(notification);
      setActiveOrder({
        orderId: Number(order.orderId),
        status: orderStatus,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        notificationStatus: notification.status,
        total: grandTotal
      });
      setCart([]);
      setToast(
        payment.status === "SUCCESS"
          ? "Order placed and payment received."
          : "Order saved, but payment still needs attention."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const serviceCards = [
    {
      icon: UserRound,
      title: "User Service",
      endpoint: "http://localhost:8080/api/users/register",
      status: customer ? "Live" : "Waiting",
      summary: customer ? `${customer.firstName} ${customer.lastName}` : "Profile creation and lookup"
    },
    {
      icon: Store,
      title: "Restaurant Service",
      endpoint: "http://localhost:8080/api/restaurants",
      status: restaurants.length ? "Live" : "Waiting",
      summary: restaurants.length ? `${restaurants.length} restaurants loaded` : "Restaurant catalog and menu"
    },
    {
      icon: ShoppingBag,
      title: "Order Service",
      endpoint: customer ? `http://localhost:8080/api/orders/user/${customer.id}` : "http://localhost:8080/api/orders",
      status: orderHistory.length || activeOrder ? "Live" : "Waiting",
      summary: orderHistory.length ? `${orderHistory.length} order records` : "Order placement and tracking"
    },
    {
      icon: CreditCard,
      title: "Payment Service",
      endpoint: customer ? `http://localhost:8080/api/payments/user/${customer.id}` : "http://localhost:8080/api/payments",
      status: paymentHistory.length || activeOrder ? "Live" : "Waiting",
      summary: paymentHistory.length ? `${paymentHistory.length} payment records` : "Payment authorization and status"
    },
    {
      icon: BellRing,
      title: "Notification Service",
      endpoint: "http://localhost:8080/api/notifications/order-update",
      status: lastNotification ? "Live" : "Waiting",
      summary: lastNotification ? `${lastNotification.channel} ${lastNotification.status}` : "Email and SMS delivery updates"
    }
  ];

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/users", label: "User UI", icon: UserRound },
    { path: "/restaurants", label: "Restaurant UI", icon: Store },
    { path: "/orders", label: "Order UI", icon: ShoppingBag },
    { path: "/payments", label: "Payment UI", icon: CreditCard },
    { path: "/notifications", label: "Notification UI", icon: BellRing }
  ];

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  }

  function renderUserPanel() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">User Service</span>
            <h2>Customer profile</h2>
          </div>
          {customer && (
            <div className="status-pill">
              <CheckCircle2 size={16} />
              Active
            </div>
          )}
        </div>

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
        ) : (
          <form className="account-form" onSubmit={handleRegister}>
            <div className="form-grid two-up">
              <label>
                <span>First name</span>
                <input name="firstName" value={userForm.firstName} onChange={updateUserForm} />
              </label>
              <label>
                <span>Last name</span>
                <input name="lastName" value={userForm.lastName} onChange={updateUserForm} />
              </label>
              <label className="wide-field">
                <span>Email</span>
                <input name="email" type="email" value={userForm.email} onChange={updateUserForm} />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" value={userForm.password} onChange={updateUserForm} />
              </label>
              <label>
                <span>Phone</span>
                <input name="phoneNumber" value={userForm.phoneNumber} onChange={updateUserForm} />
              </label>
              <label className="wide-field">
                <span>Address</span>
                <input name="address" value={userForm.address} onChange={updateUserForm} />
              </label>
            </div>
            <button className="primary-button" type="submit" disabled={registering}>
              {registering ? "Creating profile..." : "Create customer"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>
    );
  }

  function renderRestaurantPanel() {
    return (
      <>
        <section className="hero-strip">
          {selectedRestaurant && (
            <>
              <img
                src={restaurantVisuals[selectedRestaurant.name]}
                alt={selectedRestaurant.name}
                className="hero-image"
              />
              <div className="hero-content">
                <span className="eyebrow">Restaurant Service</span>
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
                    {selectedRestaurant.rating?.toFixed(1)} rating
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Restaurant Service</span>
              <h2>Restaurant catalog</h2>
            </div>
            <span className="muted">{cuisineSummary || "Loading catalog"}</span>
          </div>

          {loadingRestaurants ? (
            <div className="empty-state">Loading restaurant catalog...</div>
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
                          <Star size={14} />
                          {restaurant.rating?.toFixed(1)}
                        </span>
                      </div>
                      <span>{restaurant.cuisine}</span>
                      <span>{restaurant.address}</span>
                      <span>{restaurant.phoneNumber}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="menu-grid">
                {selectedRestaurant?.menuItems?.map((item) => (
                  <article key={item.id} className="menu-item">
                    <div className="menu-copy">
                      <strong>{item.name}</strong>
                      <p>{item.description}</p>
                    </div>
                    <div className="menu-actions">
                      <span className="price-tag">
                        <IndianRupee size={14} />
                        {item.price}
                      </span>
                      <button type="button" className="icon-button" onClick={() => addToCart(item)}>
                        Add
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </>
    );
  }

  function renderOrdersPanel() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Order Service</span>
            <h2>Order activity</h2>
          </div>
        </div>

        {activeOrder && (
          <div className="active-order">
            <div className="active-order-row">
              <strong>Order #{activeOrder.orderId}</strong>
              <span className="status-pill success">{activeOrder.status}</span>
            </div>
            <div className="active-order-grid">
              <span>Payment: {activeOrder.paymentStatus}</span>
              <span>Txn: {activeOrder.transactionId || "Pending"}</span>
              <span>Notice: {activeOrder.notificationStatus}</span>
              <span>Total: {currency(activeOrder.total)}</span>
            </div>
          </div>
        )}

        <div className="history-list">
          {orderHistory.length === 0 ? (
            <div className="empty-state">No orders yet.</div>
          ) : (
            orderHistory.map((order) => (
              <div key={order.orderId} className="history-row">
                <div className="history-main">
                  <strong>Order #{order.orderId}</strong>
                  <span>Restaurant #{order.restaurantId}</span>
                </div>
                <div className="history-side">
                  <span className="status-pill">{order.status}</span>
                  <strong>{currency(order.totalAmount)}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  }

  function renderPaymentsPanel() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Payment Service</span>
            <h2>Checkout and payments</h2>
          </div>
          <span className="cart-badge">
            <ShoppingBag size={16} />
            {cart.reduce((count, item) => count + item.quantity, 0)}
          </span>
        </div>

        <div className="cart-list">
          {cart.length === 0 ? (
            <div className="empty-state">Choose dishes to start an order.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.restaurantName}</span>
                </div>
                <div className="qty-controls">
                  <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                    +
                  </button>
                </div>
                <strong>{currency(item.quantity * item.price)}</strong>
              </div>
            ))
          )}
        </div>

        <form className="checkout-form" onSubmit={handleCheckout}>
          <div className="summary-list">
            <div>
              <span>Subtotal</span>
              <strong>{currency(cartSubtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{currency(deliveryFee)}</strong>
            </div>
            <div>
              <span>Taxes</span>
              <strong>{currency(taxes)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{currency(grandTotal)}</strong>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span>Payment mode</span>
              <select name="paymentMethod" value={paymentForm.paymentMethod} onChange={updatePaymentForm}>
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cardholder</span>
              <input name="cardholderName" value={paymentForm.cardholderName} onChange={updatePaymentForm} />
            </label>
            <label>
              <span>Card number</span>
              <input name="cardNumber" value={paymentForm.cardNumber} onChange={updatePaymentForm} />
            </label>
            <div className="form-grid two-up">
              <label>
                <span>Expiry</span>
                <input name="expiryDate" value={paymentForm.expiryDate} onChange={updatePaymentForm} />
              </label>
              <label>
                <span>CVV</span>
                <input name="cvv" value={paymentForm.cvv} onChange={updatePaymentForm} />
              </label>
            </div>
            <label>
              <span>Delivery note</span>
              <textarea
                name="instructions"
                rows="3"
                value={paymentForm.instructions}
                onChange={updatePaymentForm}
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={submitting || cart.length === 0}>
            <CreditCard size={16} />
            {submitting ? "Processing..." : "Place order"}
          </button>
        </form>

        <div className="service-output-list compact-top">
          <div className="output-block">
            <div className="output-title">
              <CreditCard size={16} />
              Recent payments
            </div>
            {paymentHistory.length === 0 ? (
              <div className="empty-inline">No payment activity yet.</div>
            ) : (
              paymentHistory.slice().reverse().slice(0, 5).map((payment) => (
                <div key={payment.id} className="output-row">
                  <span>Order #{payment.orderId}</span>
                  <span>{payment.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  function renderNotificationsPanel() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Notification Service</span>
            <h2>Notification output</h2>
          </div>
        </div>

        {lastNotification ? (
          <div className="notification-card">
            <strong>{lastNotification.status}</strong>
            <span>{lastNotification.channel}</span>
            <span>{lastNotification.message}</span>
            <span>{lastNotification.recipient}</span>
          </div>
        ) : (
          <div className="empty-state">Place an order to trigger a notification.</div>
        )}
      </section>
    );
  }

  function renderDashboard() {
    return (
      <main className="dashboard-grid">
        <section className="stack">
          {renderUserPanel()}
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Restaurant Service</span>
                <h2>Restaurant catalog</h2>
              </div>
              <span className="muted">{cuisineSummary || "Loading catalog"}</span>
            </div>

            {loadingRestaurants ? (
              <div className="empty-state">Loading restaurant catalog...</div>
            ) : (
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
                          <Star size={14} />
                          {restaurant.rating?.toFixed(1)}
                        </span>
                      </div>
                      <span>{restaurant.cuisine}</span>
                      <span>{restaurant.address}</span>
                      <span>{restaurant.phoneNumber}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="stack wide-stack">
          {renderRestaurantPanel()}

          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">API Explorer</span>
                <h2>Direct service links</h2>
              </div>
            </div>

            <div className="endpoint-grid">
              <a href="http://localhost:8080/api/users/register" target="_blank" rel="noreferrer" className="endpoint-card">
                <span>User Service</span>
                <strong>/api/users/register</strong>
              </a>
              <a href="http://localhost:8080/api/restaurants" target="_blank" rel="noreferrer" className="endpoint-card">
                <span>Restaurant Service</span>
                <strong>/api/restaurants</strong>
              </a>
              <a href="http://localhost:8080/api/orders" target="_blank" rel="noreferrer" className="endpoint-card">
                <span>Order Service</span>
                <strong>/api/orders</strong>
              </a>
              <a href="http://localhost:8080/api/payments" target="_blank" rel="noreferrer" className="endpoint-card">
                <span>Payment Service</span>
                <strong>/api/payments</strong>
              </a>
              <a
                href="http://localhost:8080/api/notifications/order-update"
                target="_blank"
                rel="noreferrer"
                className="endpoint-card"
              >
                <span>Notification Service</span>
                <strong>/api/notifications/order-update</strong>
              </a>
            </div>
          </section>
        </section>

        <section className="stack">
          {renderPaymentsPanel()}
          {renderOrdersPanel()}
          {renderNotificationsPanel()}
        </section>
      </main>
    );
  }

  function renderCurrentPage() {
    switch (currentPath) {
      case "/users":
        return <main className="single-page-grid">{renderUserPanel()}</main>;
      case "/restaurants":
        return <main className="single-page-grid">{renderRestaurantPanel()}</main>;
      case "/orders":
        return <main className="single-page-grid">{renderOrdersPanel()}</main>;
      case "/payments":
        return <main className="single-page-grid">{renderPaymentsPanel()}</main>;
      case "/notifications":
        return <main className="single-page-grid">{renderNotificationsPanel()}</main>;
      default:
        return renderDashboard();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <ChefHat size={20} />
          </div>
          <div>
            <div className="eyebrow">Online food ordering system</div>
            <h1>FoodFlow Service Dashboard</h1>
          </div>
        </div>
        <div className="topbar-meta">
          <div className="metric">
            <span>Restaurants</span>
            <strong>{restaurants.length}</strong>
          </div>
          <div className="metric">
            <span>Orders</span>
            <strong>{orderHistory.length}</strong>
          </div>
          <div className="metric wide">
            <span>Frontend</span>
            <strong>localhost:5173</strong>
          </div>
        </div>
      </header>

      <nav className="route-bar">
        {navItems.map(({ path, label, icon: Icon }) => (
          <a
            key={path}
            href={path}
            className={`route-link ${currentPath === path ? "active" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              navigate(path);
            }}
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
      </nav>

      <section className="service-grid">
        {serviceCards.map((card) => (
          <ServiceCard key={card.title} {...card} />
        ))}
      </section>
      {renderCurrentPage()}

      <footer className="footer-strip">
        <div>
          <Clock3 size={16} />
          Restaurant data is live from the backend
        </div>
        <div>
          <ReceiptText size={16} />
          Frontend on 5173, gateway on 8080
        </div>
      </footer>

      {(toast || error) && <div className={`toast ${error ? "error" : ""}`}>{error || toast}</div>}
    </div>
  );
}
