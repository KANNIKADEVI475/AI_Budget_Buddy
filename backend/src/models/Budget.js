import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    monthlyBudget: {
      type: Number,
      required: true,
      default: 3000,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    categoryBudgets: [
      {
        category: { type: String, required: true },
        limit: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
