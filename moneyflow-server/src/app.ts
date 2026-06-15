import express from "express";
import cors from "cors";
import routes from "./routes";
import { languageMiddleware } from "./i18n";

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : true;

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());
app.use(languageMiddleware);

app.use("/api", routes);

export default app;
