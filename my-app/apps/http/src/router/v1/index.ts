import { Router } from "express";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { spaceRouter } from "./space";

export const router = Router();

router.post("/signup", (req, res) => {
  res.json({
    message: "Signup",
  });
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
