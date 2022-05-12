import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';

export interface Room {
  roomId: string;
  maxUser: number;
  title: string;
  password: string | null;
  users: RoomInUser[];
  gameType: string | null;
  subject: string | null;
  hostId: number | null;
}
export interface Lobby {
  roomId: 'LOBBY';
  maxUser: number;
  users: User[];
}
