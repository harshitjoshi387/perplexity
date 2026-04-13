import { Router } from "express";
import ChatModel from "../model/chat.model.js";
import MessageModel from "../model/message.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const chat = await ChatModel.create({ user: req.user._id, title });

    return res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const chats = await ChatModel.find({ user: req.user._id })
      .populate("user", "username email verified")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:chatId", async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      _id: req.params.chatId,
      user: req.user._id,
    }).populate("user", "username email verified");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await MessageModel.find({ chat: chat._id }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: {
        chat,
        messages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:chatId", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const chat = await ChatModel.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user._id },
      { title },
      { new: true, runValidators: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:chatId", async (req, res) => {
  try {
    const chat = await ChatModel.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    await MessageModel.deleteMany({ chat: chat._id });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
