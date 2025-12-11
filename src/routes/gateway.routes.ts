import { Router } from "express";
import { GatewayController } from "../controllers/gateway.controller";
import { requireApiKey } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireApiKey);

router.post("/execute", GatewayController.executeCommand);

export default router;
