import { Document } from 'mongoose';
import { User } from 'src/users/interfaces/user.interface';

export interface Message extends Document {
  message: String;
  user: User;
  created_at: Date;
  updated_at: Date;
}
