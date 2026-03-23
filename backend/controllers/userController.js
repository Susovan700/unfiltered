import User from "../models/UserModel.js";
import Post from "../models/PostModel.js";
import Comment from "../models/CommentModel.js";
import cloudinary from "../utils/cloudinary.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json([]);

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("username profilePicture");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own account!" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Post.deleteMany({ user: req.params.id });
    await Comment.deleteMany({ user: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Account and all associated data deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own profile" });
    }

    let updateData = { ...req.body };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "unfiltered_profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      updateData.profilePicture = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
