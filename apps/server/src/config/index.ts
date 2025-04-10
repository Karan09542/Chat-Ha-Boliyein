import { getIpv4Address } from "../utils/getIpv4Address";

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const PORT = process.env.PORT || 1008;
export const IS_PROD = process.env.NODE_ENV === "production";

export const REDIS_URL = IS_PROD ? `${process.env.REDIS_URL}` : `redis://${getIpv4Address()}:6379`;