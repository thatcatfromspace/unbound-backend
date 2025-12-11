import { Router } from "express";
import userRouter from "./user.route";

import authRouter from "./auth.route";
import adminRouter from "./admin.routes";
import gatewayRouter from "./gateway.routes";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello world!");
});

router.get("/health", (req, res) => {
  res.send("OK");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/gateway", gatewayRouter);

export default router;
