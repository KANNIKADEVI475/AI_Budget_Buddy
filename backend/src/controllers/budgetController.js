import { Budget } from '../models/Budget.js';

export class BudgetController {
  /**
   * GET /api/budgets
   * Retrieves budget configuration for authenticated user.
   */
  static async getBudget(req, res, next) {
    try {
      const userId = req.userId;
      let budget = await Budget.findOne({ userId }).lean();

      if (!budget) {
        // Return default budget configuration
        budget = {
          userId,
          monthlyBudget: 3000,
          currency: 'USD',
          categoryBudgets: [
            { category: 'Food & Dining', limit: 600 },
            { category: 'Shopping', limit: 400 },
            { category: 'Bills & Utilities', limit: 500 },
            { category: 'Entertainment', limit: 300 },
            { category: 'Travel', limit: 350 },
            { category: 'Health', limit: 200 },
            { category: 'Education', limit: 250 },
          ],
        };
      }

      return res.status(200).json({
        success: true,
        budget,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/budgets
   * Updates or creates budget settings for authenticated user.
   */
  static async updateBudget(req, res, next) {
    try {
      const userId = req.userId;
      const { monthlyBudget, categoryBudgets, currency } = req.body;

      if (monthlyBudget !== undefined && (typeof monthlyBudget !== 'number' || monthlyBudget <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'monthlyBudget must be a positive number.',
        });
      }

      const budget = await Budget.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...(monthlyBudget !== undefined && { monthlyBudget }),
            ...(Array.isArray(categoryBudgets) && { categoryBudgets }),
            ...(currency && { currency }),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully.',
        budget,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/budgets
   * Resets budget for the authenticated user.
   */
  static async resetBudget(req, res, next) {
    try {
      const userId = req.userId;
      await Budget.deleteOne({ userId });

      return res.status(200).json({
        success: true,
        message: 'Budget reset to defaults.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export default BudgetController;
