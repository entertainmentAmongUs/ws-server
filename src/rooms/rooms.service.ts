import { Injectable } from '@nestjs/common';
import { User } from 'src/users/interfaces/user.interface';
import { RoomDto } from './dtos/room.dto';
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

  createLobby() {
    if (this.findById(로비.id)) {
      return;
    }

    this.rooms.push(로비);
  }

  create(room: Room) {
    this.rooms.push(room);
  }

  join(id: Room['id'], user: User) {
    if (!this.findById(id)) {
      throw new Error('해당 방 정보가 존재하지 않습니다.');
    }

    const roomIndex = this.findByIndex(id);

    this.rooms[roomIndex].users = [...this.rooms[roomIndex].users, user];
  }

  leaveBySocketId(socketId: string) {
    if (!this.findById(socketId)) {
      throw new Error('해당 방 정보가 존재하지 않습니다.');
    }

    const roomIndex = this.findByUserSocketId(socketId);

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.id !== socketId
    );
  }

  findById(id: Room['id']) {
    return this.rooms.find((room) => room.id === id);
  }

  findByUserSocketId(id: string) {
    return this.rooms.findIndex((room) => room.users.some((x) => x.id === id));
  }

  findByIndex(id: Room['id']) {
    return this.rooms.findIndex((room) => room.id === id);
  }

  findAll() {
    const rooms: RoomDto[] = this.rooms // TODO: 데이터 바꿔주는 다른 모듈로 빼기
      .filter((room) => room.id !== 로비.id)
      .map((room) => {
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

  update() {}

  delete() {}
}
