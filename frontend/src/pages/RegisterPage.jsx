import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setF] = useState({ name: "", email: "", password: "" });
  const [error, setE] = useState("");
  const [loading, setL] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setL(true);
    setE("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setE(err.response?.data?.message || "Registration failed");
    } finally {
      setL(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="sub">Get started for free</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handle}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setF({ ...form, name: e.target.value })}
            required
          />
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
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="switch">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
