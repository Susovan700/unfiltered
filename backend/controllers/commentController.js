import Comment from '../models/CommentModel.js';
import Post from '../models/PostModel.js';

// Logic to add a comment
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id; // We use 'id' to match postRoutes /:id/comments

        if (!content) return res.status(400).json({ message: "Comment content is required" });

        const newComment = new Comment({
            user: req.user.id,
            post: postId,
            content
        });

        const savedComment = await newComment.save();

        // Push comment to the Post array
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        const populatedComment = await savedComment.populate("user", "username profilePicture");
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logic to delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId).populate('post');
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        // Permission: Author of comment OR Owner of post
        const isCommentAuthor = comment.user.toString() === userId;
        const isPostOwner = comment.post.user.toString() === userId;

        if (!isCommentAuthor && !isPostOwner) {
            return res.status(403).json({ message: "Unauthorized deletion" });
        }

        // Remove from Post array first
        await Post.findByIdAndUpdate(comment.post._id, {
            $pull: { comments: commentId }
        });

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logic to get comments for a specific post
export const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};