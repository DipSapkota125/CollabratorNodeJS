// tryCatchAsyncHandler.ts
import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const tryCatchAsyncHandler =
  (theFunc: AsyncHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };
