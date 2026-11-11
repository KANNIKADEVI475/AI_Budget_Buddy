import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Protect budget routes with user authentication
router.use(authenticateUser);

router.get('/', BudgetController.getBudget);
router.put('/', BudgetController.updateBudget);
router.delete('/', BudgetController.resetBudget);

export default router;
