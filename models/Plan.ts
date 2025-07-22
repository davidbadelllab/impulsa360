import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description?: string;
  price_usd: number;
  real_value_usd?: number;
  offer_percent?: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price_usd: { type: Number, required: true },
    real_value_usd: { type: Number },
    offer_percent: { type: Number },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>('Plan', PlanSchema); 