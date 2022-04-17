import { User } from 'src/users/interfaces/user.interface';

export interface Message {
  message: String;
  user: User;
  created_at: Date;
  updated_at: Date;
}
