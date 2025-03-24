import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { IS_PROD } from "../config";
import { sendErrorDev, sendErrorProd } from "./utils";

export const globalErrorHandlingController = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (IS_PROD) sendErrorProd(err, res);
  else sendErrorDev(err, res);
};

export const unHandledRoutesController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    status: "fail",
    message: `Page not found? 4️⃣0️⃣4️⃣ ${req.originalUrl} on this server`,
  });
};
