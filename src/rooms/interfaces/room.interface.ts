import { User } from 'src/users/user.interface';
import { Message } from './message.interface';

export interface Room {
  name: String;
  title: String;
  users: User[];
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}
