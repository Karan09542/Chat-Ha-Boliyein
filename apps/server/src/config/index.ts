import { getIpv4Address } from "../utils/getIpv4Address";

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = process.env.PORT || 1008;
export const IS_PROD = process.env.NODE_ENV === "production";

export const REDIS_URL = IS_PROD ? `${process.env.REDIS_URL?.replace('<redis_password>', process.env.REDIS_PASSWORD as string)}` : `redis://${getIpv4Address()}:6379`;

export const DB_URL = IS_PROD ? `${process.env.DB_URL?.replace('<db_password>', process.env.DB_PASSWORD as string)}` : `mongodb://${getIpv4Address()}:27017`;

export const FRONTEND_URL = IS_PROD ? process.env.FRONTEND_URL : ""