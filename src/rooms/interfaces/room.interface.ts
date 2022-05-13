import { 라이어게임_제시어_타입 } from 'src/constant/subject';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';

export interface Room {
  roomId: string;
  maxUser: number;
  title: string;
  password: string | null;
  users: RoomInUser[];
  gameType: string | null;
  subject: 라이어게임_제시어_타입;
  hostId: number | null;
}
export interface Lobby {
  roomId: 'LOBBY';
  maxUser: number;
  users: User[];
}
