import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';

export class RoomDto {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  maxUser: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  password: string | null;
  @ApiProperty()
  users: UserDto[];
  @ApiProperty()
  gameType: string;
  @ApiProperty()
  subject: string;
}

export class RoomListDto {
  roomList: RoomDto[];
}

export class RoomInfoDto {
  roomId: string;
}

export class createRoomDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  gameType: string;
  @ApiProperty()
  subject: string;
  @ApiProperty()
  maxUser: string;
  @ApiProperty()
  userId: number;
}

export class joinRoomDto {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  password?: string | null;
  @ApiProperty()
  userId: number;
}

export class editRoomDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  maxUser: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  password: string | null;
  @ApiProperty()
  subject: string;
}

export class chatDto {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  message: string;
}

export class getReadyDto {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  userId: number;
}
