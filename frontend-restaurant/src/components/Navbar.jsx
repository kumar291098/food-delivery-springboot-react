import { Store } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ selectedRestaurant, loadOrders }) {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brand-mark" style={{ background: "linear-gradient(135deg, #ff8b37, #9b51e0)" }}>
          <Store size={24} />
        </div>
        <div>
          <span className="eyebrow">Restaurant Portal</span>
          <h1>Merchant Center</h1>
        </div>
      </Link>

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
            <button className="icon-button" onClick={loadOrders}>
              Refresh Orders
            </button>
          </>
        )}
        {selectedRestaurant && (
          <div className="metric wide">
            <span>Managing Store</span>
            <strong>{selectedRestaurant.name}</strong>
          </div>
        )}
      </div>
    </header>
  );
}
