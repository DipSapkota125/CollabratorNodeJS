// Define type for sendResponse options
import { Response as ExpressResponse } from "express";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}
interface SendResponseOptions<T = any> {
  success: boolean;
  message: string;
  data?: T | null; // allow null
  token?: string | Tokens | null;
  statusCode?: number;
  meta?: any; // allow meta
  pagination?: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

// sendResponse utility
export const sendResponse = <T>(
  res: ExpressResponse,
  {
    success,
    message,
    data = null,
    token = null,
    statusCode = 200,
    meta = null,
    pagination = null, // ✅ add here
  }: SendResponseOptions<T>
) => {
  const response: Record<string, any> = { success, message };

  if (data !== null) response.data = data;
  if (token) response.token = token;
  if (meta !== null) response.meta = meta;
  if (pagination !== null) response.pagination = pagination; // ✅ allow pagination

  return res.status(statusCode).json(response);
};
