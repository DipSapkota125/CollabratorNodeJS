import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import corsOptions from "./config/corsAllowOrigin";
import { errorListening } from "./helpers/error";
import { generalLimiter } from "./helpers/rateLimiter";
import { sanitizeInput } from "./helpers/sanitize";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(generalLimiter);

app.use(sanitizeInput);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

//routing
app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);

app.get("/", (req, res) => {
  res.send("✅ Server is running securely!");
});

// 9. Error handling (must be last)
app.use(errorListening);

export default app;
