import express from "express";
import userRoute from "./src/routes/user.route.js";
import authRoute from "./src/routes/auth.route.js";
import newsRoute from "./src/routes/news.route.js";
import swaggerRoute from "./src/routes/swagger.route.js";
import connectDB from "./src/database/db.js";

import { configDotenv } from "dotenv";
configDotenv();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/news", newsRoute);
app.use("/docs", swaggerRoute);

app.listen(port, () => {
  console.log("Service is running on port " + port);
});
