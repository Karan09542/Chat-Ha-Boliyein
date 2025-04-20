import express from "express"
import { addMediaController, fetchMediaController } from "../controllers/mediaController";

const mediaRoute = express.Router();

mediaRoute.post("/add", addMediaController);
mediaRoute.get("/:type", fetchMediaController);

export default mediaRoute
