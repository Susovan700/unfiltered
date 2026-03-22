"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../utils/auth.js";
import { API_BASE_URL } from "../../utils/config";
import "./profile.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      fetch(`${API_BASE_URL}/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error("Error fetching user:", err));

      fetch(`${API_BASE_URL}/api/posts`)
        .then((res) => res.json())
        .then((data) => {
          const postsArray = Array.isArray(data) ? data : (data.posts || []);
          const filtered = postsArray.filter(
            (post) => (post.user?._id || post.user) === userId
          );
          setMyPosts(filtered);
        })
        .catch((err) => {
          console.error("Error fetching posts:", err);
          setMyPosts([]);
        });
    }
  }, [router]);

  if (!user) {
    return <p className="loading">Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">
          {user.username ? user.username[0].toUpperCase() : "S"}
        </div>
        <h1>@{user.username}</h1>
        <p>{user.email}</p>
        <button className="edit-btn">Edit Profile</button>
      </div>

      <hr />

      <h2>My Thoughts ({myPosts.length})</h2>

      <div className="my-posts">
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <div key={post._id} className="post-card">
              <p className="post-content">{post.content}</p>
              {post.image && (
                <img src={post.image} className="post-img" alt="post" />
              )}
            </div>
          ))
        ) : (
          <p>You haven't shared any thoughts yet.</p>
        )}
      </div>
    </div>
  );
}