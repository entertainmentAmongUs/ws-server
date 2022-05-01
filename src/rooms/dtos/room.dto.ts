import { ApiProperty } from '@nestjs/swagger';

export class RoomDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  maxUser: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  password: string | null;
  @ApiProperty()
  userCount: number;
  @ApiProperty()
  gameType: string;
  @ApiProperty()
  subject: string;
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
