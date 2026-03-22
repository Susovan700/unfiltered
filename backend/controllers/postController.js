import Post from "../models/PostModel.js";
import Comment from "../models/CommentModel.js"; // CRITICAL: Must import to enable population
import cloudinary from '../utils/cloudinary.js';

export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        let imageUrl = "";
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "unfiltered_posts" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }
        const newPost = new Post({
            user: req.user.id,
            content,
            image: imageUrl
        });
        await newPost.save();
        
        // Populate the user before sending back so the frontend can show the username immediately
        const populatedPost = await newPost.populate("user", "username profilePicture");
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
  try {
    console.log("Fetching all posts..."); // Check if this hits your terminal
    
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" }
      })
      .sort({ createdAt: -1 });

    console.log(`Successfully found ${posts.length} posts`);
    res.status(200).json(posts);
  } catch (error) {
    console.error("DETAILED BACKEND ERROR:", error); // This will tell us the EXACT line failing
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const userId = req.user.id;
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "Unauthorized: You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};