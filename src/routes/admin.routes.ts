import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { requireApiKey, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// All routes require API Key and Admin Role
router.use(requireApiKey, requireAdmin);

router.post("/users", AdminController.createUser);
router.post("/rules", AdminController.updateRule);
router.get("/rules", AdminController.getRules);
router.get("/logs", AdminController.getLogs);

router.get("/approvals", AdminController.getPendingRequests);
router.post("/approvals/:id/approve", AdminController.approveRequest);
router.post("/approvals/:id/reject", AdminController.rejectRequest);

export default router;
