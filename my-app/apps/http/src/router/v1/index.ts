import { Router } from "express";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { SignupSchema } from "../../types";

import client from "@repo/db/client";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation Failed" });
    return;
  }

  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: parsedData.data.password,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.status(200).json({ userId: user.id });
    return;
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
});

router.post("/signin", (req, res) => {
  res.json({
    message: "Signin",
  });
});

router.get("/elements", (req, res) => {
  res.json({
    message: "Elements",
  });
});

router.get("/avatars", (req, res) => {
  res.json({
    message: "Avatars",
  });
});

router.use("/admin", adminRouter);
router.use("/user", userRouter);
router.use("/space", spaceRouter);
