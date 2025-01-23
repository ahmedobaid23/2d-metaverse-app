import { Router } from "express";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { SigninSchema, SignupSchema } from "../../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prismaClient from "@repo/db/prismaClient";
import { JWT_SECRET } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation Failed" });
    return;
  }

  const hashedPassword = await bcrypt.hashSync(parsedData.data.password, 10);
  try {
    const user = await prismaClient.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
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

router.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({ message: "Username and Password are required" });
    return;
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: {
        username: parsedData.data.username,
      },
    });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    const isValid = await bcrypt.compare(
      parsedData.data.password,
      user.password
    );

    if (!isValid) {
      res.status(403).json({ message: "Invalid Password" });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.status(200).json({
      token,
    });
  } catch (error) {
    res.status(400).json({ message: "Internal Server Error" });
    return;
  }
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
