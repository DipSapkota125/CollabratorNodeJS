import { NextFunction, RequestHandler, Response } from "express";

type AsyncHandler<Req = any> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const tryCatchAsyncHandler =
  <Req = any>(theFunc: AsyncHandler<Req>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(theFunc(req as Req, res, next)).catch(next);
  };
