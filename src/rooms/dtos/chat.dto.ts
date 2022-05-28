import { IsString } from 'class-validator';
import { Room } from '../interfaces/room.interface';

export class ChatDto {
  @IsString()
  roomId: Room['roomId'];
  @IsString()
  message: string;
}

export class GameChatDto {
  @IsString()
  roomId: Room['roomId'];
  @IsString()
  status: 'HINT' | 'FREE_CHAT' | 'VOTE';
  @IsString()
  nickName: string;
  @IsString()
  message: string;
}
