import { Schema } from 'mongoose';

const message = new Schema({
  message: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const MessageSchema = message;
