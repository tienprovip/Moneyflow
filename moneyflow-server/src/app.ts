import express from "express";
import cors from "cors";
import routes from "./routes";
import { languageMiddleware } from "./i18n";

const app = express();

app.use(cors());
app.use(express.json());
app.use(languageMiddleware);

app.use("/api", routes);

export default app;
