import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setF] = useState({ email: "", password: "" });
  const [error, setE] = useState("");
  const [loading, setL] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setL(true);
    setE("");
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setE(err.response?.data?.message || "Login failed");
    } finally {
      setL(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to your account</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handle}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setF({ ...form, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setF({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
