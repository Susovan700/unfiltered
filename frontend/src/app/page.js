"use client";
import Link from "next/link";
import "./page.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="logo-text">Unfiltered</h1>
        <p className="tagline">Share your thoughts. No filters. No noise.</p>
        
        <div className="auth-options">
          <Link href="/login" className="home-btn login-btn">
            Login
          </Link>
          <Link href="/register" className="home-btn register-btn">
            Create Account
          </Link>
        </div>
      </div>

      <div className="footer-info">
        <p>Join @jarvis_dev and others sharing their real thoughts.</p>
      </div>
    </div>
  );
}