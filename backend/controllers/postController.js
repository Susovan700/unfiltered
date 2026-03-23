import Post from "../models/PostModel.js";
import Comment from "../models/CommentModel.js"; 
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
        
        
        const populatedPost = await newPost.populate("user", "username profilePicture");
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
  try {
    console.log("Fetching all posts...");
    
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
    console.error("DETAILED BACKEND ERROR:", error); 
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

export const addComment = async (req,res) => {
    try{
        const { content } = req.body;
        const postId  = req.params.id;

        const newComment = new Comment({
            user: req.user.id,
            post: postId,
            content
        });

        await newComment.save();

        const post = await Post.findById(postId);
        post.comments.push(newComment._id);
        await post.save();

        const populatedComment = await newComment.populate("user", "username");
        res.status(201).json(populatedComment);
    }catch(error){
        res.status(500).json({message: error.message});
    }
};