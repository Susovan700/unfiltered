"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./Navbar.css";
import Search from "../Search/page.js";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link href="/">Unfiltered</Link>
        <Search />
      </div>
      <div className="nav-links">
        <Link href="/feed">Feed</Link>
        <Link href="/profile">Profile</Link>
        <span className="nav-divider" />
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}