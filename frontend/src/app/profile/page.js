"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../utils/auth.js";
import { API_BASE_URL } from "../../utils/config";
import "./profile.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  const fetchUserData = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      try {
        const userRes = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const userData = await userRes.json();
        setUser(userData);
        setNewName(userData.username);

        const postsRes = await fetch(`${API_BASE_URL}/api/posts`);
        const postsData = await postsRes.json();
        const postsArray = Array.isArray(postsData) ? postsData : postsData.posts || [];
        const filtered = postsArray.filter(
          (post) => (post.user?._id || post.user) === userId
        );
        setMyPosts(filtered);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [router]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("username", newName);
    if (newPhoto) formData.append("profilePicture", newPhoto);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        setPreviewUrl(null);
        alert("Profile updated successfully!");
        fetchUserData(); 
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmFirst = window.confirm("Are you sure? This removes everything forever.");
    if (confirmFirst) {
      const confirmSecond = window.prompt("Type username to confirm:");
      if (confirmSecond === user.username) {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          localStorage.clear();
          router.push("/register");
        }
      }
    }
  };

  if (!user) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="dp-img" />
          ) : user.profilePicture ? (
            <img src={user.profilePicture} alt="DP" className="dp-img" />
          ) : (
            <span className="avatar-letter">
              {/* Added a safety check here */}
              {user.username ? user.username[0].toUpperCase() : "U"}
            </span>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="edit-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="edit-input"
              placeholder="Username"
              required
            />
            {/* Improved the button label here */}
            <label className="file-label" style={{ cursor: 'pointer', color: '#6366f1' }}>
              📷 Click here to change photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
            <div className="edit-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => { setIsEditing(false); setPreviewUrl(null); }} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="user-info">
            <h1>@{user.username}</h1>
            <p>{user.email}</p>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}
      </div>

      <hr />
      <h2>My Thoughts ({myPosts.length})</h2>
      <div className="my-posts">
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <div key={post._id} className="post-card">
              <p className="post-content">{post.content}</p>
              {post.image && <img src={post.image} className="post-img" alt="post" />}
            </div>
          ))
        ) : (
          <p>No thoughts shared yet.</p>
        )}
      </div>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <button className="delete-acc-btn" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}