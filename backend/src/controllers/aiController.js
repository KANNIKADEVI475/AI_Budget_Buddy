import { Transaction } from '../models/Transaction.js';
import { Budget } from '../models/Budget.js';

export class AIController {
  /**
   * GET /api/ai/insights
   * Dynamically analyzes user's actual MongoDB transactions to generate
   * algorithmic financial observations and budget alerts.
   */
  static async getInsights(req, res, next) {
    try {
      const userId = req.userId;

      const [transactions, budgetDoc] = await Promise.all([
        Transaction.find({ userId }).sort({ transactionDate: -1 }).lean(),
        Budget.findOne({ userId }).lean(),
      ]);

      const monthlyBudget = budgetDoc?.monthlyBudget || 3000;

      if (!transactions || transactions.length === 0) {
        return res.status(200).json({
          success: true,
          hasData: false,
          message: 'No transactions found. Synchronize or seed data to generate AI insights.',
          insights: [],
        });
      }

      // Calculate totals
      let totalIncome = 0;
      let totalExpenses = 0;
      const categoryMap = {};

      for (const t of transactions) {
        const amt = t.amount || 0;
        if (amt > 0) {
          totalIncome += amt;
        } else {
          const abs = Math.abs(amt);
          totalExpenses += abs;
          const cat = t.category || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + abs;
        }
      }

      // Sort categories by expenditure
      const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
      const topCategory = sortedCategories[0];

      const insights = [];

      // 1. Highest spending observation
      if (topCategory && totalExpenses > 0) {
        const pct = Math.round((topCategory[1] / totalExpenses) * 100);
        insights.push({
          id: 'ins_top_spending',
          type: 'observation',
          title: 'Primary Spending Driver',
          description: `${topCategory[0]} is currently your highest expenditure at $${topCategory[1].toFixed(2)} (${pct}% of total monthly outflows).`,
          icon: 'TrendingUp',
          priority: 'medium',
        });
      }

      // 2. Budget threshold warning
      const usagePct = Math.round((totalExpenses / monthlyBudget) * 100);
      if (usagePct >= 100) {
        insights.push({
          id: 'ins_budget_exceeded',
          type: 'alert',
          title: 'Budget Limit Exceeded',
          description: `You have spent $${totalExpenses.toFixed(2)}, exceeding your monthly budget of $${monthlyBudget.toFixed(2)} by $${(totalExpenses - monthlyBudget).toFixed(2)}.`,
          icon: 'AlertTriangle',
          priority: 'high',
        });
      } else if (usagePct >= 80) {
        insights.push({
          id: 'ins_budget_warning',
          type: 'warning',
          title: 'Approaching Budget Limit',
          description: `You have utilized ${usagePct}% ($${totalExpenses.toFixed(2)}) of your $${monthlyBudget.toFixed(2)} monthly budget. Remaining allowance: $${(monthlyBudget - totalExpenses).toFixed(2)}.`,
          icon: 'AlertCircle',
          priority: 'high',
        });
      } else {
        insights.push({
          id: 'ins_budget_healthy',
          type: 'positive',
          title: 'Healthy Budget Pacing',
          description: `You are comfortably pacing at ${usagePct}% of your $${monthlyBudget.toFixed(2)} budget with $${(monthlyBudget - totalExpenses).toFixed(2)} remaining.`,
          icon: 'CheckCircle2',
          priority: 'low',
        });
      }

      // 3. Cash flow balance
      const netCashFlow = totalIncome - totalExpenses;
      if (netCashFlow > 0) {
        insights.push({
          id: 'ins_net_positive',
          type: 'savings',
          title: 'Net Positive Cash Flow',
          description: `Your income exceeds your expenses by +$${netCashFlow.toFixed(2)} this cycle. Consider transferring a portion to emergency savings or investments.`,
          icon: 'Sparkles',
          priority: 'medium',
        });
      } else {
        insights.push({
          id: 'ins_net_deficit',
          type: 'warning',
          title: 'Negative Cash Flow Alert',
          description: `Expenses exceed recorded income by -$${Math.abs(netCashFlow).toFixed(2)}. Review discretionary purchases to restore balance.`,
          icon: 'TrendingDown',
          priority: 'high',
        });
      }

      // 4. Actionable savings recommendation
      if (topCategory && topCategory[1] > 50) {
        const potentialSavings = (topCategory[1] * 0.15).toFixed(2);
        insights.push({
          id: 'ins_recommendation',
          type: 'tip',
          title: `Smart Recommendation for ${topCategory[0]}`,
          description: `Reducing ${topCategory[0]} spending by just 15% would save you an estimated $${potentialSavings} every month.`,
          icon: 'Lightbulb',
          priority: 'low',
        });
      }

      return res.status(200).json({
        success: true,
        hasData: true,
        transactionCount: transactions.length,
        totalExpenses,
        totalIncome,
        insights,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/ask
   * Conversational finance assistant answering questions using actual user transactions.
   */
  static async askAssistant(req, res, next) {
    try {
      const userId = req.userId;
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'A question query is required.',
        });
      }

      const q = question.toLowerCase();
      const transactions = await Transaction.find({ userId }).lean();

      let totalExpenses = 0;
      let totalIncome = 0;
      const categoryMap = {};

      for (const t of transactions) {
        const amt = t.amount || 0;
        if (amt > 0) totalIncome += amt;
        else {
          const abs = Math.abs(amt);
          totalExpenses += abs;
          const cat = t.category || 'Uncategorized';
          categoryMap[cat] = (categoryMap[cat] || 0) + abs;
        }
      }

      const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
      const top = sorted[0];

      let answer = '';

      if (q.includes('most') || q.includes('highest') || q.includes('where did i spend')) {
        if (top) {
          answer = `Based on your synchronized records, you spent the most on **${top[0]}** ($${top[1].toFixed(2)}), which represents ${Math.round((top[1] / totalExpenses) * 100)}% of your total expenses.`;
        } else {
          answer = 'No expenses found yet. Once transactions are synced, I can identify your largest spending categories!';
        }
      } else if (q.includes('save') || q.includes('tip') || q.includes('recommendation')) {
        if (top) {
          answer = `To boost savings, consider setting a 15% lower cap on **${top[0]}** (saving ~$${(top[1] * 0.15).toFixed(2)}/mo). Also check for recurring subscriptions in your transaction history.`;
        } else {
          answer = 'A great general rule for students and young professionals is the 50/30/20 rule: 50% for Needs, 30% for Wants, and 20% for Savings!';
        }
      } else if (q.includes('income') || q.includes('earned')) {
        answer = `Your total recorded income is **$${totalIncome.toFixed(2)}** across ${transactions.filter(t => t.amount > 0).length} incoming transaction(s).`;
      } else if (q.includes('expense') || q.includes('total spend') || q.includes('how much did i spend')) {
        answer = `Your total recorded expenses are **$${totalExpenses.toFixed(2)}** across ${transactions.filter(t => t.amount < 0).length} outgoing transaction(s).`;
      } else {
        answer = `I analyzed your ${transactions.length} recorded transaction(s). You have spent $${totalExpenses.toFixed(2)} with income of $${totalIncome.toFixed(2)}. Your top spending category is **${top ? top[0] : 'None'}**. Ask me about your spending breakdown, budgets, or ways to save!`;
      }

      return res.status(200).json({
        success: true,
        question,
        answer,
        analyzedTransactionsCount: transactions.length,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AIController;
