import { Injectable } from '@nestjs/common';
import { LobbyUser } from 'src/users/interfaces/lobbyUser.interface';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { createRoomDto, RoomDto } from './dtos/room.dto';
import { Lobby, Room } from './interfaces/room.interface';

export const 로비: Lobby = {
  roomId: 'LOBBY', // 랜덤 아이디로 할 필요있음 방이름이 로비일 수 있으니
  maxUser: 100,
  users: [],
};

@Injectable()
export class RoomsService {
  private readonly lobby: Lobby = 로비;
  private readonly rooms: Room[] = [];
  private readonly users: RoomInUser[] = [];
  // private logger: Logger = new Logger('RoomsService');

  createUser(user: RoomInUser) {
    this.users.push(user);
    return this.users;
  }

  findUserById(id: User['socketId']) {
    return this.users.find((user) => user.socketId === id);
  }

  joinLobby(user: LobbyUser) {
    this.lobby.users = [...this.lobby.users, user];
  }

  findLobby() {
    return this.lobby;
  }

  create(room: Omit<createRoomDto, 'userId'>) {
    const roomObject = {
      ...room,
      users: [],
      maxUser: Number(room.maxUser),
      roomId: uuidv4(),
      hostId: null,
    };
    this.rooms.push(roomObject);

    return roomObject;
  }

  join(id: Room['roomId'], user: RoomInUser) {
    if (!this.findById(id)) {
      throw new Error('해당 방 정보가 존재하지 않습니다.');
    }

    const roomIndex = this.findRoomIndex(id);

    if (this.rooms[roomIndex].users.length === 0) {
      this.rooms[roomIndex].hostId = user.userId;
    }

    this.rooms[roomIndex].users = [...this.rooms[roomIndex].users, user];

    return this.rooms[roomIndex];
  }

  leaveBySocketId(socketId: string) {
    if (this.findByUserSocketId(socketId) === -1) {
      return -1;
    }

    const roomIndex = this.findByUserSocketId(socketId);

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.socketId !== socketId
    );
  }

  findById(id: Room['roomId']) {
    return this.rooms.find((room) => room.roomId === id);
  }

  findByUserSocketId(id: string) {
    return this.rooms.findIndex((room) =>
      room.users.some((x) => x.socketId === id)
    );
  }

  findRoomIndex(id: Room['roomId']) {
    return this.rooms.findIndex((room) => room.roomId === id);
  }

  findRoomInfoByRoomIndex(idx: number) {
    return this.rooms[idx];
  }

  findAll() {
    const rooms: RoomDto[] = this.rooms
      .filter((room) => room.roomId !== 로비.roomId)
      .map((room) => {
        return {
          roomId: room.roomId,
          maxUser: room.maxUser,
          title: room.title,
          password: room.password,
          users: room.users,
          gameType: room.gameType,
          subject: room.subject,
        };
      });

    return rooms;
  }

  updateUserReadyStatus(roomIndex: number, userId: RoomInUser['socketId']) {
    this.rooms[roomIndex].users = this.rooms[roomIndex].users.map((x) => {
      if (x.socketId === userId) {
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

  removeUserData(userSocketId: string) {
    const userIndex = this.users.findIndex(
      (user) => user.socketId === userSocketId
    );
    this.users.splice(userIndex, 1);

    return this.users;
  }

  // IsLobbyInUser(userSocketId: string) {
  //   const isExistUser = this.
  // }

  delete() {}
}

// TODO: user와 room service 폴더 나누기
