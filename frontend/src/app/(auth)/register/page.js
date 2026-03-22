"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./register.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Redirecting to login...");
        router.push("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Join Unfiltered</h2>
        <form onSubmit={handleRegister} className="auth-form">
          <input 
            type="text" 
            placeholder="Username" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button type="submit" className="auth-btn">Create Account</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}