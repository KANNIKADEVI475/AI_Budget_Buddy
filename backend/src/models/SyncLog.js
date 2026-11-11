import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
      index: true,
    },
    fetchedCount: {
      type: Number,
      default: 0,
    },
    insertedCount: {
      type: Number,
      default: 0,
    },
    updatedCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SyncLog = mongoose.model('SyncLog', syncLogSchema);
export default SyncLog;
