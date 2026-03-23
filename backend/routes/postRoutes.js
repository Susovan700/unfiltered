import express from 'express';
import { createPost, getAllPosts, likePost, deletePost } from '../controllers/postController.js';
import { addComment, deleteComment } from '../controllers/commentController.js'; // Import from commentController
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createPost); 
router.get('/', getAllPosts);               
router.put('/:id/like', verifyToken, likePost); 
router.delete('/:id', verifyToken, deletePost);

// Comment routes attached to posts
router.post('/:id/comments', verifyToken, addComment); 
router.delete('/comments/:commentId', verifyToken, deleteComment);

export default router;