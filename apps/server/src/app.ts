import http from "http";
import SocketService from "./services/socket0";
import express, { Express, Request, Response } from "express";
import cors from "cors";

import {
  globalErrorHandlingController,
  unHandledRoutesController,
} from "./errorHanding/ErrorHandlingControllers";
import {
  fetchIPAddressController,
  fetchURLTitleController,
} from "./controllers/appController";
import mediaRoute from "./routes/mediaRoute";
import { FRONTEND_URL } from "./config";


const app = express();

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:3000",
  })
);

app.use("/media", mediaRoute)
// init socket

const socketService = new SocketService();
const httpServer = http.createServer(app);

socketService.io.attach(httpServer);
socketService.initListeners();

// express
app.get("/", async (req, res) => {
  res.status(200).json({ message: "सीताराम सीताराम" });
});

app.post("/fetch-url-title", fetchURLTitleController);

// error handling
// ------------------

// unhandled routes
app.use("*", unHandledRoutesController);
// global error handler
app.use(globalErrorHandlingController);
// ------------------

export default httpServer;
