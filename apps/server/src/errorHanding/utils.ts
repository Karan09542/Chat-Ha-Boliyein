import { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

export const CatchAsync = (fn: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await fn(req, res, next).catch(next);
  };
};

export const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({ status: err.status, message: err.message });
};

export const sendErrorProd = (err: AppError, res: Response) => {
  if (err.statusCode === 500) {
    return res.status(500).json({
      status: err.status,
      message: "Oh something went wrong",
    });
  } else {
    return res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  }
};
