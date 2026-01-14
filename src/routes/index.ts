import { Router } from "express";
import authRouter from "./auth.route";

const router = Router();

router.use("/api/auth", authRouter);

export default router;
