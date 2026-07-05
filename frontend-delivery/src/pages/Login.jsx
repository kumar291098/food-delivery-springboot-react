import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isDriverLoginMode, setIsDriverLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "Rohan",
    lastName: "Singh",
    email: `rider.${Date.now()}@demo.com`,
    password: "secretpassword",
    phoneNumber: "9876543201",
    address: "Central Hub, Residency Road"
  });

  function updateLoginForm(e) {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateRegisterForm(e) {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(registerForm);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "20px" }}>
      <section className="panel" style={{ width: "100%", maxWidth: "500px", padding: "30px" }}>
        <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "4px", marginBottom: "24px" }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              background: isDriverLoginMode ? "#10ac84" : "transparent",
              color: isDriverLoginMode ? "#fff" : "#475569",
              transition: "all 0.2s"
            }}
            onClick={() => setIsDriverLoginMode(true)}
          >
            Login
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              cursor: "pointer",
              background: !isDriverLoginMode ? "#10ac84" : "transparent",
              color: !isDriverLoginMode ? "#fff" : "#475569",
              transition: "all 0.2s"
            }}
            onClick={() => setIsDriverLoginMode(false)}
          >
            Register Rider
          </button>
        </div>

        {error && <div className="toast error" style={{ position: "static", marginBottom: "16px" }}>{error}</div>}

        {isDriverLoginMode ? (
          <form className="account-form" onSubmit={handleLoginSubmit}>
            <h2 style={{ marginBottom: "20px" }}>Rider Sign In</h2>
            <div className="stack" style={{ gap: "15px", marginBottom: "20px" }}>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Email</span>
                <input name="email" type="email" value={loginForm.email} onChange={updateLoginForm} required />
              </label>
              <label style={{ display: "grid", gap: "6px" }}>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: "600" }}>Password</span>
                <input name="password" type="password" value={loginForm.password} onChange={updateLoginForm} required />
              </label>
            </div>
            <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", background: "#10ac84" }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="account-form" onSubmit={handleRegisterSubmit}>
            <h2 style={{ marginBottom: "20px" }}>Rider Registration</h2>
            <div className="form-grid two-up" style={{ marginBottom: "20px" }}>
              <label>
                <span>First name</span>
                <input name="firstName" value={registerForm.firstName} onChange={updateRegisterForm} required />
              </label>
              <label>
                <span>Last name</span>
                <input name="lastName" value={registerForm.lastName} onChange={updateRegisterForm} required />
              </label>
              <label className="wide-field">
                <span>Email</span>
                <input name="email" type="email" value={registerForm.email} onChange={updateRegisterForm} required />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" value={registerForm.password} onChange={updateRegisterForm} required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phoneNumber" value={registerForm.phoneNumber} onChange={updateRegisterForm} required />
              </label>
              <label className="wide-field">
                <span>Address</span>
                <input name="address" value={registerForm.address} onChange={updateRegisterForm} required />
              </label>
            </div>
            <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", background: "#10ac84" }}>
              {loading ? "Creating rider..." : "Register"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
