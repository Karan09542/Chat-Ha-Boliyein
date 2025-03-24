import { Request, Response, NextFunction } from "express";
import { CatchAsync } from "../errorHanding/utils";
import { AppError } from "../errorHanding/AppError";

import os from "os";

export const fetchURLTitleController = CatchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;

    try {
      const response = await fetch(url as string);
      if (!response.ok) {
        return next(new AppError("Please provide a valid url", 400));
      }

      const html = await response.text();

      const titleRegex = /<title>(.*?)<\/title>/;

      const titleMatch = html?.match(titleRegex);

      const title = titleMatch?.[1];

      return res.status(200).json({ status: "success", title });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error });
    }
  }
);

export const fetchIPAddressController = CatchAsync(
  async (req: Request, res: Response) => {
    const networkInterfaces = os.networkInterfaces();
    let ipAddress;

    for (const name of Object.keys(networkInterfaces)) {
      if (!networkInterfaces[name]) continue;
      for (const net of networkInterfaces[name]) {
        if (net.family === "IPv4" && !net.internal) {
          ipAddress = net.address;
          break;
        }
      }
      if (ipAddress) {
        break;
      }
    }

    return res.status(200).json({ status: "success", ipAddress });
  }
);
