import mongoose, { Schema, Document } from 'mongoose';

export interface ITempUser extends Document {
  email: string;
  phone: string;
  password: string;
  otp: string;
  expires: Date;
}

const TempUserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  otp: { type: String, required: true },
  expires: { type: Date, required: true },
}, { timestamps: true });

TempUserSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ITempUser>('TempUser', TempUserSchema);