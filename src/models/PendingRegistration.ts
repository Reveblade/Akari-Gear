import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingRegistration extends Document {
  email: string;
  password: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ email: 1 });
pendingRegistrationSchema.index({ token: 1 });
pendingRegistrationSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration = mongoose.model<IPendingRegistration>(
  'PendingRegistration',
  pendingRegistrationSchema
);
