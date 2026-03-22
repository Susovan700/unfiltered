import express from "express";
import {
  getUserProfile,
  updateUser,
  deleteUser,
  searchUsers
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id", verifyToken, updateUser);
router.get('/search', searchUsers);

export default router;
