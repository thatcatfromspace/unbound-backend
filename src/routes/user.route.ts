import { Router } from 'express';
import { getUsers, createUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getUsers);
router.post('/', authenticate, createUser);

export default router;
