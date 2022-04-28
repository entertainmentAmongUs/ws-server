import { ApiProperty } from '@nestjs/swagger';

export class RoomDto {
  @ApiProperty()
  id: String;
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
