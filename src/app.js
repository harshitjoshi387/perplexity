import express from "express";
import apiRouter from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI chatbot backend is running",
  });
});

app.use("/api", apiRouter);

export default app;
