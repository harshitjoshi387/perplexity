import { Router } from "express";
import ChatModel from "../model/chat.model.js";
import MessageModel from "../model/message.model.js";
import UserModel from "../model/user.model.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { user, title } = req.body;

    if (!user || !title) {
      return res.status(400).json({
        success: false,
        message: "user and title are required",
      });
    }

    const existingUser = await UserModel.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const chat = await ChatModel.create({ user, title });

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
    const filter = {};

    if (req.query.user) {
      filter.user = req.query.user;
    }

    const chats = await ChatModel.find(filter)
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
    const chat = await ChatModel.findById(req.params.chatId).populate(
      "user",
      "username email verified"
    );

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

    const chat = await ChatModel.findByIdAndUpdate(
      req.params.chatId,
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
    const chat = await ChatModel.findByIdAndDelete(req.params.chatId);

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
