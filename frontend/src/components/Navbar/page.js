"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; 
import "./Navbar.css";
import Search from "../Search/page.js";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); 
  const authPages = ["/", "/login", "/register"];
  const isAuthPage = authPages.includes(pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link href="/">Unfiltered</Link>
        
        {/* {!isAuthPage && <Search />} */}
      </div>

      <div className="nav-links">
        
        {!isAuthPage ? (
          <>
            <Link href="/feed">Feed</Link>
            <Link href="/profile">Profile</Link>
            <span className="nav-divider" />
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            
            {pathname === "/" && (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Join Now</Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}