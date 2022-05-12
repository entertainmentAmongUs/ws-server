import { LobbyUser } from 'src/users/interfaces/lobbyUser.interface';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';

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
  users: LobbyUser[];
}
