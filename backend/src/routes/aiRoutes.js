import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Protect AI routes with user authentication
router.use(authenticateUser);

router.get('/insights', AIController.getInsights);
router.post('/ask', AIController.askAssistant);

export default router;
