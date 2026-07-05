import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const initialUserForm = {
  firstName: "Avi",
  lastName: "Sharma",
  email: `avi.${Date.now()}@demo.com`,
  password: "secret123",
  phoneNumber: "9876543210",
  address: "221B Residency Road, Bengaluru"
};

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [userForm, setUserForm] = useState(initialUserForm);

  function updateLoginForm(e) {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateUserForm(e) {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
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
      await register(userForm);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <section className="panel" style={{ width: "100%", maxWidth: "500px", padding: "32px" }}>
        <div className="panel-heading" style={{ marginBottom: "24px" }}>
          <h2>{isLoginMode ? "Login to FoodFlow" : "Create Customer Account"}</h2>
        </div>

        <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "4px", marginBottom: "24px" }}>
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
        </div>

        {error && <div className="toast error" style={{ position: "static", marginBottom: "16px" }}>{error}</div>}

        {isLoginMode ? (
          <form className="account-form" onSubmit={handleLoginSubmit}>
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
            <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Logging in..." : "Login"}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form className="account-form" onSubmit={handleRegisterSubmit}>
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
            <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}>
              {loading ? "Creating account..." : "Register"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
