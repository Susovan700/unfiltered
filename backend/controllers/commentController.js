import Comment from '../models/CommentModel.js';
import Post from '../models/PostModel.js';

export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;

        const newComment = new Comment({
            user: req.user.id,
            post: postId,
            content
        });

        const savedComment = await newComment.save();

       
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};