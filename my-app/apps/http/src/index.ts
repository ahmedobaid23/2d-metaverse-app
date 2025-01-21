import express from "express";
import { router } from "./router/v1";

const app = express();
app.use(express.json());

app.use("/api/v1", router);

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running on port 3000")
);
