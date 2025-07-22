import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyPlan extends Document {
  company: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  start_date: Date;
  end_date?: Date;
  payment_due_date: Date;
  payment_status: 'pagado' | 'moroso' | 'pendiente';
  payment_method?: string;
  invoice_url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyPlanSchema: Schema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    payment_due_date: { type: Date, required: true },
    payment_status: { type: String, enum: ['pagado', 'moroso', 'pendiente'], required: true },
    payment_method: { type: String },
    invoice_url: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICompanyPlan>('CompanyPlan', CompanyPlanSchema); 