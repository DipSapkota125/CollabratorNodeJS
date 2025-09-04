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
  }: SendResponseOptions<T>
) => {
  const response: Record<string, any> = { success, message };

  if (data !== null) response.data = data;
  if (token) response.token = token;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};
