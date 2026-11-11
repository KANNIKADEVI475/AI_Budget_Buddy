import mongoose from 'mongoose';

export const VALID_CATEGORIES = [
  'Uncategorized',
  'Food & Dining',
  'Shopping',
  'Travel',
  'Entertainment',
  'Bills & Utilities',
  'Education',
  'Health',
  'Income',
  'Transfers',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    paypalTransactionId: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
    merchantName: {
      type: String,
      default: '',
      trim: true,
    },
    transactionType: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: VALID_CATEGORIES,
      default: 'Uncategorized',
      index: true,
    },
    categorySource: {
      type: String,
      enum: ['default', 'manual'],
      default: 'default',
    },
    source: {
      type: String,
      default: 'paypal_sandbox',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to guarantee duplicate prevention per user
transactionSchema.index({ userId: 1, paypalTransactionId: 1 }, { unique: true });

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
