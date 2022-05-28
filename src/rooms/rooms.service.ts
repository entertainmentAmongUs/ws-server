import { Injectable } from '@nestjs/common';
import { 라이어게임_제시어 } from 'src/constant/subject';
import { RoomInUser } from 'src/users/interfaces/roomInUser.interface';
import { User } from 'src/users/interfaces/user.interface';
import { shuffleArray } from 'src/utils/shuffleArray';
import { v4 as uuidv4 } from 'uuid';
import { CreateRoomDto } from './dtos/room.dto';
import { Game } from './interfaces/game.interface';
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
  private readonly users: User[] = [];
  private readonly games: Game[] = [];
  // private logger: Logger = new Logger('RoomsService');

  // 유저
  createUser(user: User) {
    this.users.push(user);
    return this.users;
  }

  findUserBySocketId(socketId: User['socketId']) {
    return this.users.find((user) => user.socketId === socketId);
  }

  findUserByUserId(userId: RoomInUser['userId']) {
    return this.users.find((user) => user.userId === userId);
  }

  // 로비
  joinLobby(user: User) {
    this.lobby.users = [...this.lobby.users, user];
  }

  findLobby() {
    return this.lobby;
  }

  IsUserInLobby(socketId: string) {
    return this.lobby.users.find((user) => user.socketId === socketId);
  }

  isExistUserData(socketId: string) {
    return this.users.find((user) => user.socketId === socketId);
  }

  removeUserData(socketId: string) {
    const userIndex = this.users.findIndex(
      (user) => user.socketId === socketId
    );
    this.users.splice(userIndex, 1);

    return this.users;
  }

  leaveLobby(socketId: string) {
    this.lobby.users = this.lobby.users.filter(
      (user) => user.socketId !== socketId
    );
  }

  // 방
  create(room: Omit<CreateRoomDto, 'userId'>) {
    const roomObject = {
      ...room,
      users: [],
      maxUser: Number(room.maxUser),
      roomId: uuidv4(),
      hostId: null,
      status: 'WAITING' as const,
    };
    this.rooms.push(roomObject);

    return roomObject;
  }

  join(roomId: Room['roomId'], user: RoomInUser) {
    if (!this.findById(roomId)) {
      throw new Error('해당 방 정보가 존재하지 않습니다.');
    }

    const roomIndex = this.findRoomIndex(roomId);

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

  findById(roomId: Room['roomId']) {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  findByUserSocketId(socketId: string) {
    return this.rooms.findIndex((room) =>
      room.users.some((x) => x.socketId === socketId)
    );
  }

  findRoomIndex(roomId: Room['roomId']) {
    return this.rooms.findIndex((room) => room.roomId === roomId);
  }

  findRoomInfoByRoomIndex(idx: number) {
    return this.rooms[idx];
  }

  getUserCount(roomId: Room['roomId']) {
    return this.rooms.find((room) => room.roomId === roomId).users.length;
  }

  findAll() {
    return this.rooms;
  }

  updateUserReadyStatus(roomId: Room['roomId'], userId: RoomInUser['userId']) {
    const roomIndex = this.findRoomIndex(roomId);

    this.rooms.find((room) => room.roomId).users = this.rooms[
      roomIndex
    ].users.map((x) => {
      if (x.userId === userId) {
        return { ...x, isReady: !x.isReady };
      }

      return x;
    });

    return this.rooms[roomIndex];
  }

  updateRoomInfo(roomIndex: number, roomData: Room) {
    this.rooms[roomIndex] = roomData;

    return this.rooms[roomIndex];
  }

  IsUserInRoom(socketId: string) {
    return this.rooms.some((room) =>
      room.users.some((x) => x.socketId === socketId)
    );
  }

  transferRoomInfoData(room: Room) {
    return {
      ...room,
      users: room.users.map((user) => {
        return {
          userId: user.userId,
          nickName: user.nickName,
          isReady: user.isReady,
        };
      }),
    };
  }

  leaveRoom(roomId: Room['roomId'], userId: RoomInUser['userId']) {
    const roomIndex = this.findRoomIndex(roomId);

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.userId !== userId
    );

    // 방에서 나간 사람이 호스트라면 다음 사람에게 호스트를 넘김
    if (
      this.rooms[roomIndex].hostId === userId &&
      this.rooms[roomIndex].users.length > 0
    ) {
      this.rooms[roomIndex].hostId = this.rooms[roomIndex].users[0].userId;
    }

    // 방에서 사람이 다 나가면 방 삭제
    if (this.rooms[roomIndex].users.length === 0) {
      this.rooms.splice(roomIndex, 1);
    }
  }

  kick(roomId: Room['roomId'], userId: RoomInUser['userId']) {
    // 방에 있는 유저를 강퇴시킨다.
    const roomIndex = this.findRoomIndex(roomId);
    this.rooms[roomIndex].users = this.rooms[roomIndex].users.filter(
      (user) => user.userId !== userId
    );
  }

  roomStatusToStart(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);

    this.rooms[roomIndex].status = 'PLAYING' as const;
  }

  deleteRoom(roomIndex: number) {
    this.rooms.splice(roomIndex, 1);
  }

  // Game
  createGame(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const room = this.rooms[roomIndex];

    const order = this.setOrder(roomId);
    const keyword = this.setKeyword(roomId);
    const liar = this.setLiar(roomId);
    const vote = this.createVoteSystem(roomId);

    const game: Game = {
      roomId: room.roomId,
      loadingEndNumber: 0,
      order,
      keyword,
      liar,
      vote,
    };

    this.games.push(game);

    return game;
  }

  setKeyword(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const roomInfo = this.rooms[roomIndex];

    const subjectRandomNumber = Math.floor(
      Math.random() * 라이어게임_제시어[roomInfo.subject].length
    );

    return 라이어게임_제시어[roomInfo.subject][subjectRandomNumber];
  }

  setLiar(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const roomInfo = this.rooms[roomIndex];
    const userRandomNumber = Math.floor(Math.random() * roomInfo.users.length);
    const userIdArray = roomInfo.users.map((user) => {
      return user.userId;
    });

    return userIdArray[userRandomNumber];
  }

  setOrder(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const roomInfo = this.rooms[roomIndex];

    const orderArray = Array(roomInfo.users.length)
      .fill(0)
      .map((x, i) => {
        return x + i;
      });

    const order = shuffleArray(orderArray);

    return order;
  }

  createVoteSystem(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const roomInfo = this.rooms[roomIndex];

    const voteArray = roomInfo.users.map((user) => {
      return {
        userId: user.userId,
        count: 0,
      };
    });

    return voteArray;
  }

  addLoadingEnd(roomId: Room['roomId']) {
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);

    this.games[gameIndex].loadingEndNumber += 1;
  }

  isAllLoadingEnd(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);
    const userCount = this.rooms[roomIndex].users.length;

    if (this.games[gameIndex].loadingEndNumber === userCount) {
      return true;
    }

    return false;
  }

  getGameInfo(roomId: Room['roomId']) {
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);

    return this.games[gameIndex];
  }

  addVote(roomId: Room['roomId'], targetUserId: RoomInUser['userId']) {
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);

    this.games[gameIndex].vote[
      this.games[gameIndex].vote.findIndex((x) => x.userId === targetUserId)
    ].count += 1;

    const voteCount = this.games[gameIndex].vote.reduce((prev, cur) => {
      return prev + cur.count;
    }, 0);

    return voteCount;
  }

  isMultipleMaxVoteCount(roomId: Room['roomId']) {
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);

    const maxValue = Math.max(
      ...this.games[gameIndex].vote.map((x) => x.count)
    );
    const maxVoteCount = this.games[gameIndex].vote.filter((x) => {
      return x.count === maxValue;
    }).length;

    if (maxVoteCount > 1) {
      return true;
    }

    return false;
  }

  initializeRoom(roomId: Room['roomId']) {
    const roomIndex = this.findRoomIndex(roomId);

    this.rooms[roomIndex].users = this.rooms[roomIndex].users.map((user) => {
      return {
        ...user,
        isReady: false,
      };
    });
    this.rooms[roomIndex].status = 'WAITING';
  }

  destroyGame(roomId: Room['roomId']) {
    const gameIndex = this.games.findIndex((x) => x.roomId === roomId);

    this.games.splice(gameIndex, 1);
  }
}

// TODO: user와 room service 폴더 나누기
