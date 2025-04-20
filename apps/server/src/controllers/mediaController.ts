import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHanding/AppError";
import { CatchAsync } from "../errorHanding/utils";
import { MediaModel } from "../model/imageModel";

interface MediaRequestBody {
    url: string;
    type: "gif" | "sticker";
    filename: string;
    tags: string[];
}
interface GetMediaRequestQuery {
    page?: number;
    limit?: number;
    search?: string
}
type GetMediaParams = {
    type: "gif" | "sticker";
  };

export const addMediaController = CatchAsync(async (req: Request<{}, {}, MediaRequestBody>, res: Response, next: NextFunction) => {
    const { url, type, filename, tags } = req.body
    if (!url || !type || !filename || !tags) {
        return next(new AppError("All fields are required", 400))
    }

    await MediaModel.create({ url, type, filename, tags })
    return res.status(201).json({
        status: "success",
        message: "Media added successfully"
    })
});

export const fetchMediaController = 
    CatchAsync(async (req: Request<GetMediaParams, {}, {}, GetMediaRequestQuery>, res: Response, _next: NextFunction) => {
        const { type }  = req.params

        let {page = 1, limit = 10, search = "" } = req.query;

        search = search as string;

        page = Number(page);
        limit = Number(limit);
        if(isNaN(page) || isNaN(limit)) {
            page = 1;
            limit = 10;
        }
        if(page < 1) page = 1;
        if(limit < 1) limit = 10;
        
        const skip = (page - 1)*limit
        
        let media

        if(search) {
            media = await MediaModel.find({type , $text: { $search: search} }).limit(limit).skip(skip);
        } else {
            media = await MediaModel.find({ type }).limit(limit).skip(skip);
        }

        return res.status(200).json({
            status: "success",
            data: media,
            pagination: {
                page,
                limit
            }
        });
    })
