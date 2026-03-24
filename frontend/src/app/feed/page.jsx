"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../utils/auth";
import { API_BASE_URL } from "../../utils/config";
import "./feed.css";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchPosts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this thought?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchPosts();
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setContent("");
      setImage(null);
      setPreviewUrl(null);
      fetchPosts();
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchPosts();
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    if (!commentTexts[postId]) return;

    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: commentTexts[postId] }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
      setCommentTexts({ ...commentTexts, [postId]: "" });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this reply?")) return;
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/api/posts/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments.filter((c) => c._id !== commentId) }
            : post
        )
      );
    } else {
      alert("Could not delete comment.");
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="feed-container">
      <div className="create-post-box">
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          {previewUrl && (
            <div className="image-preview-container">
              <img src={previewUrl} alt="Preview" className="preview-img" />
              <button
                type="button"
                onClick={() => { setImage(null); setPreviewUrl(null); }}
                className="remove-prev-btn"
              >
                ✕
              </button>
            </div>
          )}
          <div className="form-actions">
            <input type="file" accept="image/*" onChange={handleImageChange} id="file-upload" hidden />
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? "Change Image" : "Add Image"}
            </label>
            <button type="submit" className="post-btn">Share Thought</button>
          </div>
        </form>
      </div>

      <h1>Recent Thoughts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <strong>@{post.user?.username || "anonymous"}</strong>
                  <div className="header-right">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.user?._id === localStorage.getItem("userId") && (
                      <button className="del-btn" onClick={() => handleDelete(post._id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                {post.image && (
                  <div className="post-img-wrap">
                    <img src={post.image} alt="post" />
                  </div>
                )}

                <div className="post-footer">
                  <button
                    className="like-btn"
                    onClick={() => handleLike(post._id)}
                    style={{ color: post.likes?.includes(localStorage.getItem("userId")) ? "#f43f5e" : "#888" }}
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>
                  <button className="comment-toggle-btn" onClick={() => toggleComments(post._id)}>
                    💬 {post.comments?.length || 0}
                  </button>
                </div>

                {showComments[post._id] && (
                  <div className="comment-section">
                    <div className="comment-input-group">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={commentTexts[post._id] || ""}
                        onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                      />
                      <button onClick={() => handleComment(post._id)}>Reply</button>
                    </div>
                    <div className="comments-list">
                      {post.comments?.map((c) => (
                        <div key={c._id} className="individual-comment">
                          <div className="comment-main">
                            <strong>@{c.user?.username || "user"}:</strong>
                            <span className="comment-text">{c.content}</span>
                          </div>
                          {(c.user?._id === localStorage.getItem("userId") || post.user?._id === localStorage.getItem("userId")) && (
                            <button
                              className="del-comment-btn"
                              onClick={() => handleDeleteComment(post._id, c._id)}
                              title="Delete reply"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No thoughts found. Be the first to post!</p>
          )}
        </div>
      )}
    </div>
  );
}
