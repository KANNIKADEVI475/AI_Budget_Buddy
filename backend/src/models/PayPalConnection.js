import mongoose from 'mongoose';

const payPalConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    clientId: {
      type: String,
      required: true,
      trim: true,
    },
    encryptedClientSecret: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ['sandbox'],
      default: 'sandbox',
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
      index: true,
    },
    autoSyncEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    nextSyncAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PayPalConnection = mongoose.model('PayPalConnection', payPalConnectionSchema);
export default PayPalConnection;
