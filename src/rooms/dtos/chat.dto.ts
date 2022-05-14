import { IsString } from 'class-validator';
import { Room } from '../interfaces/room.interface';

export class ChatDto {
  @IsString()
  roomId: Room['roomId'];
  @IsString()
  message: string;
}
