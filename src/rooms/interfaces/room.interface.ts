import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';

export interface Room {
  roomId: string;
  maxUser: number;
  title: string;
  password: string | null;
  users: RoomInUser[];
  gameType: string | null;
  subject: string | null;
  hostId: string | null;
}
