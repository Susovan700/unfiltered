"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./Search.css";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length > 1) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/search?query=${val}`);
        const data = await res.json();

        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="text"
        placeholder="Find users..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />
      
      {results.length > 0 && (
        <div className="search-results">
          {results.map((user) => (
            <Link 
              key={user._id} 
              href={`/profile/${user._id}`} 
              onClick={() => {
                setResults([]);
                setQuery(""); 
              }}
            >
              <div className="search-item">
                @{user.username}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}