import { getIpv4Address } from "../utils/getIpv4Address";

export const PORT = process.env.PORT || 1008;
export const IS_PROD = process.env.NODE_ENV === "production";
export const REDIS_URL = IS_PROD ? `${process.env.REDIS_URL}` : `redis://${getIpv4Address()}:6379`;
