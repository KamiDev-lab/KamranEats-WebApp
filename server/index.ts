import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import menuRoute from "./routes/menu.route";
import orderRoute from "./routes/order.route";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { stripeWebhook } from "./controller/order.controller";

dotenv.config();
const connectDB = (): Promise<void> => {
    return Promise.resolve();
};

interface ProcessEnv {
  NODE_ENV: "production" | "development" | "test";
  PORT?: string;
  VITE_FRONTEND_URL: string;
  LOCAL_FRONTEND_URL: string;
}

declare const process: {
  env: ProcessEnv;
};


const app = express();

app.post("/api/v1/webhook", express.raw({ type: "application/json" }), stripeWebhook);

connectDB();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: [process.env.VITE_FRONTEND_URL, process.env.LOCAL_FRONTEND_URL],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/restaurant", restaurantRoute);
app.use("/api/v1/menu", menuRoute);
app.use("/api/v1/order", orderRoute);

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
