import { 라이어게임_주제_타입 } from 'src/constant/subject';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';

export interface Room {
  roomId: string;
  maxUser: number;
  title: string;
  password: string | null;
  users: RoomInUser[];
  gameType: 'LIAR' | 'IMAGE';
  subject: 라이어게임_주제_타입;
  hostId: number;
}
export interface Lobby {
  roomId: 'LOBBY';
  maxUser: number;
  users: User[];
}
