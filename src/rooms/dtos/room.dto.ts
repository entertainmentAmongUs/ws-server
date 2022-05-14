import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';
import { Room } from '../interfaces/room.interface';

export class RoomDto {
  @IsString()
  roomId: Room['roomId'];
  @IsNumber()
  maxUser: Room['maxUser'];
  @IsString()
  title: Room['title'];
  @IsString()
  password: Room['password'];
  @IsArray()
  users: RoomInUser[];
  @IsString()
  gameType: Room['gameType'];
  @IsString()
  subject: Room['subject'];
  @IsNumber()
  hostId: Room['hostId'];
  @IsString()
  status: Room['status'];
}

export class RoomListDto {
  @IsArray()
  roomList: RoomDto[];
}

export class RoomInfoDto {
  @IsString()
  roomId: Room['roomId'];
}

export class CreateRoomDto {
  @IsString()
  title: Room['title'];
  @IsOptional()
  password?: Room['password'];
  @IsString()
  gameType: Room['gameType'];
  @IsString()
  subject: Room['subject'];
  @IsNumber()
  maxUser: Room['maxUser'];
  @IsNumber()
  userId: User['userId'];
}

export class JoinRoomDto {
  @IsString()
  roomId: Room['roomId'];
  @IsOptional()
  password?: Room['password'];
  @IsNumber()
  userId: User['userId'];
}

export class LeaveRoomDto {
  @IsString()
  roomId: Room['roomId'];
  @IsNumber()
  userId: User['userId'];
}

export class EditRoomDto {
  @IsString()
  roomId: Room['roomId'];
  @IsNumber()
  maxUser: Room['maxUser'];
  @IsString()
  title: Room['title'];
  @IsString()
  password: Room['password'];
  @IsString()
  subject: Room['subject'];
  @IsString()
  gameType: Room['gameType'];
}

export class GetReadyDto {
  @IsString()
  roomId: Room['roomId'];
  @IsNumber()
  userId: User['userId'];
}
