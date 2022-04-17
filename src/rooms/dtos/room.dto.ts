export interface RoomDto {
  id: String;
  maxUser: number;
  title: string;
  password: string | null;
  userCount: number;
  gameType: string;
  subject: string;
}
