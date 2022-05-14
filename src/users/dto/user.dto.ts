import { IsNumber, IsString } from 'class-validator';
import { RoomDto } from 'src/rooms/dtos/room.dto';

export class UserDto {
  @IsNumber()
  userId: number;
  @IsString()
  nickName: string;
}

export class KickDto {
  @IsString()
  roomId: RoomDto['roomId'];
  @IsNumber()
  userId: UserDto['userId'];
}
