import { IUser } from "../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: IUser;
}
