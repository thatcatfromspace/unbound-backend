import { Router } from "express";
import { getUsers, createUser } from "../controllers/user.controller";
import { requireApiKey } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireApiKey, getUsers);
router.post("/", requireApiKey, createUser);

export default router;
