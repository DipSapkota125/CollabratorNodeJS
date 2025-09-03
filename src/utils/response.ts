// Define type for sendResponse options
import { Response as ExpressResponse } from "express";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Update SendResponseOptions to allow object token
interface SendResponseOptions<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string | Tokens | null; // allow object
  statusCode?: number;
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

  if (data) response.data = data;
  if (token) response.token = token;
  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
};
