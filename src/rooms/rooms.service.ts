import { Injectable, Logger } from '@nestjs/common';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { createRoomDto, RoomDto } from './dtos/room.dto';
import { Room } from './interfaces/room.interface';

export const 로비: Room = {
  id: 'LOBBY', // 랜덤 아이디로 할 필요있음 방이름이 로비일 수 있으니
  maxUser: 100,
  title: '로비',
  password: null,
  users: [],
  gameType: null,
  subject: null,
};

@Injectable()
export class RoomsService {
  private readonly rooms: Room[] = [];
  private readonly users: RoomInUser[] = [];
  private logger: Logger = new Logger('RoomsService');

  createUser(user: RoomInUser) {
    this.users.push(user);

    return this.users;
  }

  findUserById(id: User['id']) {
    return this.users.find((user) => user.id === id);
  }

  createLobby() {
    if (this.findById(로비.id)) {
      return;
    }

    this.rooms.push(로비);
    this.logger.log('로비를 생성하였습니다.');
    this.logger.log(this.rooms);
  }

  joinLobby(id: Room['id'], user: RoomInUser) {
    if (!this.findById(id)) {
      throw new Error('해당 로비가 존재하지 않습니다.');
    }

    const roomIndex = this.findRoomIndex(id);

    this.rooms[roomIndex].users = [...this.rooms[roomIndex].users, user];
    this.logger.log('로비에 참여하였습니다.');
    this.logger.log(this.rooms);
  }

  create(room: createRoomDto) {
    const roomObject = {
      ...room,
      users: [],
      maxUser: Number(room.maxUser),
      id: uuidv4(),
    };
    this.rooms.push(roomObject);
    this.logger.log('방을 생성하였습니다.');
    this.logger.log(this.rooms);

    return roomObject;
  }

  join(id: Room['id'], user: RoomInUser) {
    if (!this.findById(id)) {
      throw new Error('해당 방 정보가 존재하지 않습니다.');
    }

    const roomIndex = this.findRoomIndex(id);

    this.rooms[roomIndex].users = [...this.rooms[roomIndex].users, user];
    this.logger.log('방에 참여하였습니다.');
    this.logger.log(this.rooms);

    return this.rooms[roomIndex];
  }

  leaveBySocketId(socketId: string) {
    if (this.findByUserSocketId(socketId) === -1) {
      return -1;
    }

    const roomIndex = this.findByUserSocketId(socketId);

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.id !== socketId
    );
    this.logger.log('방을 떠났습니다.');
    this.logger.log(this.rooms);
  }

  findById(id: Room['id']) {
    this.logger.log('방아이디를 기준으로 찾습니다.');
    this.logger.log(this.rooms.find((room) => room.id === id));
    return this.rooms.find((room) => room.id === id);
  }

  findByUserSocketId(id: string) {
    return this.rooms.findIndex((room) => room.users.some((x) => x.id === id));
  }

  findRoomIndex(id: Room['id']) {
    return this.rooms.findIndex((room) => room.id === id);
  }

  findRoomInfoByRoomIndex(idx: number) {
    return this.rooms[idx];
  }

  findAll() {
    const rooms: RoomDto[] = this.rooms // TODO: 데이터 바꿔주는 다른 모듈로 빼기
      .filter((room) => room.id !== 로비.id)
      .map((room) => {
        console.log(room);

        return {
          id: room.id,
          maxUser: room.maxUser,
          title: room.title,
          password: room.password,
          userCount: room.users.length,
          gameType: room.gameType,
          subject: room.subject,
        };
      });

    return rooms;
  }

  updateUserReadyStatus(roomIndex: number, userId: RoomInUser['id']) {
    this.rooms[roomIndex].users = this.rooms[roomIndex].users.map((x) => {
      if (x.id === userId) {
        return { ...x, ready: !x.isReady };
      }

      return x;
    });

    return this.rooms[roomIndex];
  }

  updateRoomInfo(roomIndex, roomData: Room) {
    this.rooms[roomIndex] = roomData;

    return this.rooms[roomIndex];
  }

  delete() {}
}
