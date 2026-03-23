import express from "express";
import {
  getUserProfile,
  updateUser,
  deleteUser,
  searchUsers
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; 

const router = express.Router();

router.get("/search", searchUsers);
router.get("/:id", getUserProfile);
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id", verifyToken, upload.single("profilePicture"), updateUser);

export default router;