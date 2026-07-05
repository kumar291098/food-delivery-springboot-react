import { MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ loadOrders }) {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brand-mark" style={{ background: "linear-gradient(135deg, #10ac84, #01a3a4)" }}>
          <MapPin size={24} />
        </div>
        <div>
          <span className="eyebrow">Delivery Partner Portal</span>
          <h1>Rider Dashboard</h1>
        </div>
      </Link>

      <div className="topbar-meta">
        {driver && (
          <>
            <div className="metric">
              <span>Rider Account</span>
              <strong>{driver.firstName}</strong>
            </div>
            <button className="icon-button" onClick={handleLogout}>
              Logout
            </button>
            <button className="icon-button" onClick={loadOrders}>
              Refresh Orders
            </button>
          </>
        )}
      </div>
    </header>
  );
}
