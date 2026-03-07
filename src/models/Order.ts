import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderAddress {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  postalCode?: string;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  slug: string;
  quantity: number;
  unitPriceUsd: number;
  unitPriceTry: number;
  subtotalTry: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrder extends Document {
  user: Types.ObjectId;
  address: IOrderAddress;
  items: IOrderItem[];
  subtotalTry: number;
  shippingCostTry: number;
  totalTry: number;
  discountPercent?: number;
  status: OrderStatus;
  exchangeRateUsdToTry: number;
  exchangeRateDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    neighborhood: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    postalCode: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceUsd: { type: Number, required: true, min: 0 },
    unitPriceTry: { type: Number, required: true, min: 0 },
    subtotalTry: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: orderAddressSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    subtotalTry: { type: Number, required: true, min: 0 },
    shippingCostTry: { type: Number, default: 0, min: 0 },
    totalTry: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    exchangeRateUsdToTry: { type: Number, required: true },
    exchangeRateDate: { type: Date, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
