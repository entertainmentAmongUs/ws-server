import { ApiProperty } from '@nestjs/swagger';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';
import { Room } from '../interfaces/room.interface';

export class RoomDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  maxUser: Room['maxUser'];
  @ApiProperty()
  title: Room['title'];
  @ApiProperty()
  password: Room['password'];
  @ApiProperty()
  users: RoomInUser[];
  @ApiProperty()
  gameType: Room['gameType'];
  @ApiProperty()
  subject: Room['subject'];
}

export class RoomListDto {
  roomList: RoomDto[];
}

export class RoomInfoDto {
  roomId: Room['roomId'];
}

export class createRoomDto {
  @ApiProperty()
  title: Room['title'];
  @ApiProperty()
  password: Room['password'];
  @ApiProperty()
  gameType: Room['gameType'];
  @ApiProperty()
  subject: Room['subject'];
  @ApiProperty()
  maxUser: Room['maxUser'];
  @ApiProperty()
  userId: User['userId'];
}

export class joinRoomDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  password?: Room['password'];
  @ApiProperty()
  userId: User['userId'];
}

export class leaveRoomDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  userId: User['userId'];
}

export class editRoomDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  maxUser: Room['maxUser'];
  @ApiProperty()
  title: Room['title'];
  @ApiProperty()
  password: Room['password'];
  @ApiProperty()
  subject: Room['subject'];
}

export class chatDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  message: string;
}

export class getReadyDto {
  @ApiProperty()
  roomId: Room['roomId'];
  @ApiProperty()
  userId: User['userId'];
}
