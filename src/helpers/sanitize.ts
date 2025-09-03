// sanitizeInput.ts
import { NextFunction, Request, Response } from "express";
import mongoSanitize from "mongo-sanitize";
import sanitizeHtml from "sanitize-html";

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent NoSQL injection
  req.body = mongoSanitize(req.body);

  // Sanitize query params
  for (const key in req.query) {
    if (Object.prototype.hasOwnProperty.call(req.query, key)) {
      req.query[key] = mongoSanitize(req.query[key] as string);
    }
  }

  // Sanitize route params
  for (const key in req.params) {
    if (Object.prototype.hasOwnProperty.call(req.params, key)) {
      req.params[key] = mongoSanitize(req.params[key] as string);
    }
  }

  // Prevent XSS attacks (deep sanitize)
  const sanitizeObject = (obj: Record<string, any>): void => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(req.body);

  next();
};
