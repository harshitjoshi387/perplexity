import { Router } from "express";
import userRouter from "./user.routes.js";
import chatRouter from "./chat.routes.js";
import messageRouter from "./message.routes.js";

const router = Router();

router.use("/users", userRouter);
router.use("/chats", chatRouter);
router.use("/messages", messageRouter);

export default router;
