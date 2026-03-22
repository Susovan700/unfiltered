"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css"; 

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  // Pick the base URL from env variables, fallback to localhost for development
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Swapped hardcoded string for the variable
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        // Added a check just in case user object is nested differently
        localStorage.setItem("userId", data.user?.id || data.user?._id);
        router.push("/feed");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Network error. Make sure the backend is live.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card"> {/* Added a wrapper if needed for your CSS */}
        <h2>Login to Unfiltered</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <input 
            type="email" 
            placeholder="Email" 
            className="auth-input"
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="auth-input"
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button type="submit" className="auth-btn">LOGIN</button>
        </form>
      </div>
    </div>
  );
}