import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    financePin: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export const User = model('User', userSchema);
