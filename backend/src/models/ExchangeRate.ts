import mongoose, { Document, Schema } from 'mongoose';

export interface IExchangeRate extends Document {
  date: Date; // YYYY-MM-DD (normalized to start of day)
  usdToTry: number;
  source: string;
  createdAt: Date;
}

const exchangeRateSchema = new Schema<IExchangeRate>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    usdToTry: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      default: 'TCMB',
    },
  },
  { timestamps: true }
);

exchangeRateSchema.index({ date: -1 });

export const ExchangeRate = mongoose.model<IExchangeRate>(
  'ExchangeRate',
  exchangeRateSchema
);
