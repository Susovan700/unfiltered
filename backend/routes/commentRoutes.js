import express from 'express';
import { addComment, getPostComments } from '../controllers/commentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, addComment);
router.get('/:postId', getPostComments);

export default router;