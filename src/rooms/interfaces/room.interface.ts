import { User } from 'src/users/interfaces/user.interface';

export interface Room {
  id: string;
  maxUser: number;
  title: string;
  password: string | null;
  users: User[];
  gameType: string | null;
  subject: string | null;
}
