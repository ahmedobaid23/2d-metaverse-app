import { Router } from "express";

export const spaceRouter = Router();

spaceRouter.get("/:spaceId", (req, res) => {});
spaceRouter.post("/", (req, res) => {});
spaceRouter.post("/element", (req, res) => {});
spaceRouter.delete("/:spaceId", (req, res) => {});
spaceRouter.delete("/element", (req, res) => {});
spaceRouter.get("/all", (req, res) => {});
