import { ApiProperty, OmitType } from '@nestjs/swagger';
import { RoomDto } from 'src/rooms/dtos/room.dto';

export class User {
  @ApiProperty()
  readonly socketId: string;
  @ApiProperty()
  readonly userId: number;
  @ApiProperty()
  readonly nickName: string;
}

export class UserDto extends OmitType(User, ['socketId']) {}

export class KickDto {
  roomId: RoomDto['roomId'];
  userId: User['userId'];
}
