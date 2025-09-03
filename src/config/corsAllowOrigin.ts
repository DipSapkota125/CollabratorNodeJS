import { CorsOptions } from "cors";

const whiteList: Array<string | RegExp> = [
  "http://192.168.1.94:5173",
  "http://localhost:5173",
  "http://localhost:9000",
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (
      !origin ||
      whiteList.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      )
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Set-Cookie",
    "x-request-id",
  ],
  credentials: true,
};

export default corsOptions;
