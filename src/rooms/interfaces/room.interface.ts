import { User } from 'src/users/interfaces/user.interface';
import { Message } from './message.interface';

export interface Room {
  name: String;
  users: User[];
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}
