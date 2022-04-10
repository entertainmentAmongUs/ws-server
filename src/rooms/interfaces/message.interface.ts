import { User } from 'src/users/user.interface';

export interface Message {
  message: String;
  user: User;
  date: Date;
}
