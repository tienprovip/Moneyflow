import dotenv from "dotenv";
import cron from "node-cron";
import app from "./app";
import { connectDB } from "./config/db";
import { settleDueSavingsForAllUsers } from "./modules/account/account.service";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

cron.schedule("0 * * * *", async () => {
  try {
    await settleDueSavingsForAllUsers();
  } catch (error) {
    console.error("AUTO SETTLE CRON ERROR:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
