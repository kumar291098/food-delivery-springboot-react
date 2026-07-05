import { ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="brand-mark">
          <ShoppingBag size={24} />
        </div>
        <div>
          <span className="eyebrow">Customer Portal</span>
          <h1>FoodFlow</h1>
        </div>
      </Link>

      <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {customer && (
          <>
            <Link to="/history" style={{ textDecoration: "none", color: "#475569", fontWeight: "600" }}>
              Order History
            </Link>
            <div className="topbar-meta">
              <div className="metric">
                <span>Logged In as</span>
                <strong>{customer.firstName}</strong>
              </div>
              <button className="icon-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
