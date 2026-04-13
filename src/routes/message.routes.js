import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import ChatModel from "../model/chat.model.js";
import MessageModel from "../model/message.model.js";

const router = Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    const { chat, content, role } = req.body;

    if (!chat || !content || !role) {
      return res.status(400).json({
        success: false,
        message: "chat, content and role are required",
      });
    }

    const existingChat = await ChatModel.findOne({
      _id: chat,
      user: req.user._id,
    });

    if (!existingChat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const message = await MessageModel.create({
      chat,
      content,
      role,
    });

    existingChat.updatedAt = new Date();
    await existingChat.save();

    return res.status(201).json({
      success: true,
      data: message,
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
    const userChats = await ChatModel.find({ user: req.user._id }).select("_id");
    const chatIds = userChats.map((item) => item._id);
    const filter = { chat: { $in: chatIds } };

    if (req.query.chat) {
      const requestedChatId = String(req.query.chat);
      const isOwnedChat = chatIds.some(
        (chatId) => String(chatId) === requestedChatId
      );

      if (!isOwnedChat) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to access messages from this chat",
        });
      }

      filter.chat = req.query.chat;
    }

    const messages = await MessageModel.find(filter)
      .populate("chat", "title user")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:messageId", async (req, res) => {
  try {
    const message = await MessageModel.findById(req.params.messageId).populate(
      "chat",
      "title user"
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (String(message.chat.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this message",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
