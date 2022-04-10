import { Schema } from 'mongoose';

const user = new Schema({
  name: { String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

/**
 * On every save, add the date
 */
user.pre('save', function (next) {
  const currentDate = new Date();

  this.updated_at = currentDate;
  next();
});

export const UserSchema = user;
