import express from 'express';
import { createPost, getAllPosts, likePost, deletePost, addComment } from '../controllers/postController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createPost); 
router.get('/', getAllPosts);              
router.put('/:id/like', verifyToken, likePost); 
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/comments', verifyToken, addComment);

export default router;