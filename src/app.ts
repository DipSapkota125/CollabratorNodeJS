import cors from "cors";
import express from "express";
import helmet from "helmet";
import corsOptions from "./config/corsAllowOrigin";
import { errorListening } from "./helpers/error";
import { generalLimiter } from "./helpers/rateLimiter";
import { sanitizeInput } from "./helpers/sanitize";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(generalLimiter);

app.use(sanitizeInput);

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("✅ Server is running securely!");
});

// 9. Error handling (must be last)
app.use(errorListening);

export default app;
