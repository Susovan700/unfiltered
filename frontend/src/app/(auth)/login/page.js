"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        router.push("/feed");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-brand">Unfiltered</div>
        <p className="auth-sub">Welcome back. Say something real.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <span className="input-icon">✉</span>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <span className="input-icon">⬡</span>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link href="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}