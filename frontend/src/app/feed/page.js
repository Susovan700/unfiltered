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

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
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
    if (!window.confirm("Are you sure you want to delete this thought?"))
      return;

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      fetchPosts();
    } else {
      alert("Could not delete post.");
    }
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
            : post,
        ),
      );

      setCommentTexts({ ...commentTexts, [postId]: "" });
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
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                }}
                className="remove-prev-btn"
              >
                ✕
              </button>
            </div>
          )}

          <div className="form-actions">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="file-upload"
              hidden
            />
            <label htmlFor="file-upload" className="custom-file-upload">
              {image ? "Change Image" : "Add Image"}
            </label>
            <button type="submit" className="post-btn">
              Share Thought
            </button>
          </div>
        </form>
      </div>

      <h1>Recent Thoughts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="posts-list">
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <strong>@{post.user?.username || "anonymous"}</strong>
                  <div className="header-right">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.user?._id === localStorage.getItem("userId") && (
                      <button
                        className="del-btn"
                        onClick={() => handleDelete(post._id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                {post.image && (
                  <img src={post.image} className="post-img" alt="post" />
                )}

                <div className="post-footer">
                  <button
                    className="like-btn"
                    onClick={() => handleLike(post._id)}
                    style={{
                      color: post.likes?.includes(
                        localStorage.getItem("userId"),
                      )
                        ? "red"
                        : "#888",
                    }}
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>
                  <button
                    className="comment-toggle-btn"
                    onClick={() => toggleComments(post._id)}
                  >
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
                        onChange={(e) =>
                          setCommentTexts({
                            ...commentTexts,
                            [post._id]: e.target.value,
                          })
                        }
                      />
                      <button onClick={() => handleComment(post._id)}>
                        Reply
                      </button>
                    </div>
                    <div className="comments-list">
                      {post.comments?.map((c) => (
                        <div key={c._id} className="individual-comment">
                          <strong>@{c.user?.username || "user"}:</strong>{" "}
                          {c.content}
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
