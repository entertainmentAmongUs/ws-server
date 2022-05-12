import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AsyncApiService } from 'nestjs-asyncapi';
import { Namespace, Server, Socket } from 'socket.io';
import { KickDto, UserDto } from 'src/users/dto/user.dto';
import { ChatDto } from './dtos/chat.dto';
import {
  chatDto,
  createRoomDto,
  editRoomDto,
  RoomDto,
  RoomInfoDto,
} from './dtos/room.dto';
import { RoomsService, 로비 } from './rooms.service';

@AsyncApiService()
@WebSocketGateway({
  cors: { origin: '*' },
  allowEIO3: true,
})
export class RoomsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger(RoomsGateway.name);

  constructor(private readonly roomsService: RoomsService) {}

  afterInit(nsp: Namespace) {
    this.logger.log(`RoomsGateway가 초기화되었습니다: ${nsp?.name}`);
  }

  handleConnection(client) {
    this.logger.log(`유저가 접속했습니다: ${client.id}`);
  }

  handleDisconnect(client) {
    this.logger.log(`유저가 접속을 끊었습니다: ${client.id}`);
    if (this.roomsService.IsUserInLobby(client.id)) {
      this.roomsService.leaveLobby(client.id);
      const lobbyUserList = this.roomsService.findLobby().users;
      this.server
        .to(로비.roomId)
        .emit('lobbyUserList', { users: lobbyUserList });
    }

    if (this.roomsService.IsUserInRoom(client.id)) {
      const roomIndex = this.roomsService.findByUserSocketId(client.id);
      this.roomsService.leaveBySocketId(client.id);

      const roomInfo = this.roomsService.findRoomInfoByRoomIndex(roomIndex);
      this.server.to(roomInfo.roomId).emit('userList', roomInfo.users);
    }

    if (this.roomsService.isExistUserData(client.id)) {
      this.roomsService.removeUserData(client.id);
    }
  }

  @SubscribeMessage('joinLobby')
  joinLobby(@ConnectedSocket() socket: Socket, @MessageBody() data: UserDto) {
    this.server.socketsJoin(로비.roomId);

    const newUser = {
      socketId: socket.id,
      userId: data.userId,
      nickName: data.nickName,
    };

    this.roomsService.createUser(newUser);
    this.roomsService.joinLobby(newUser);

    const lobbyUserList = this.roomsService.findLobby().users;
    this.server.to(로비.roomId).emit('lobbyUserList', { users: lobbyUserList });

    const roomList = this.roomsService.findAll();
    this.server.to(로비.roomId).emit('roomList', { roomList });
  }

  @SubscribeMessage('chat')
  lobbyChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: ChatDto
  ) {
    this.server.to(data.roomId).emit('chat', data);
  }

  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: createRoomDto
  ) {
    const { userId, ...roomInfo } = data;
    const newRoom = this.roomsService.create(roomInfo);

    const user = {
      ...this.roomsService.findUserById(socket.id),
      isReady: false,
    };
    this.server.socketsJoin(newRoom.roomId);
    this.roomsService.join(newRoom.roomId, user);

    this.server.to(socket.id).emit('createRoom', { roomId: newRoom.roomId });
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: RoomDto['roomId'] }
  ) {
    const room = this.roomsService.findById(data.roomId);
    const user = {
      ...this.roomsService.findUserById(socket.id),
      isReady: false,
    };
    this.server.socketsJoin(data.roomId);
    const updatedRoom = this.roomsService.join(room.roomId, user);

    this.server.to(room.roomId).emit('userList', updatedRoom.users);
  }

  @SubscribeMessage('roomList')
  roomList(@ConnectedSocket() socket: Socket) {
    const roomList = this.roomsService.findAll();
    this.server.to(socket.id).emit('roomList', { roomList });
  }

  @SubscribeMessage('roomInfo')
  roomInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: RoomInfoDto
  ) {
    const roomInfo = this.roomsService.findById(data.roomId);

    const sendRoomInfo = {
      ...roomInfo,
      users: roomInfo.users.map((user) => {
        return {
          userId: user.userId,
          nickName: user.nickName,
          isReady: user.isReady,
        };
      }),
    };

    this.server.to(socket.id).emit('roomInfo', sendRoomInfo);
  }

  @SubscribeMessage('getReady')
  getReady(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: UserDto['userId']
  ) {
    const roomIndex = this.roomsService.findByUserSocketId(socket.id);

    const roomInfo = this.roomsService.updateUserReadyStatus(
      roomIndex,
      socket.id
    );

    this.server.to(roomInfo.roomId).emit('userList', roomInfo.users);

    if (roomInfo.users.every((user) => user.isReady)) {
      const order = Array()
        .fill(roomInfo.users.length)
        .map((_, i) => {
          return i;
        });

      this.server.to(roomInfo.roomId).emit('startGame', {
        keyword: '닭꼬치',
        time: '180',
        order,
        liarNumber: 0,
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    const roomIndex = this.roomsService.findByUserSocketId(socket.id);
    const roomInfo = this.roomsService.findRoomInfoByRoomIndex(roomIndex);

    this.server.socketsLeave(roomInfo.roomId);
    if (
      roomInfo.users.findIndex((user) => user.socketId === socket.id) === 0 &&
      roomInfo.users.length > 1
    ) {
      // roomInfo.users[1].isHost = true;
    }

    roomInfo.users.filter((user) => user.socketId !== socket.id);
    this.roomsService.updateRoomInfo(roomIndex, roomInfo);

    this.server.to(roomInfo.roomId).emit('userList', roomInfo.users);
  }

  @SubscribeMessage('kick')
  kick(@ConnectedSocket() socket: Socket, @MessageBody() data: KickDto) {
    const roomIndex = this.roomsService.findByUserSocketId(socket.id);
    const roomInfo = this.roomsService.findRoomInfoByRoomIndex(roomIndex);

    this.server.socketsLeave(roomInfo.roomId);
    roomInfo.users.filter((user) => user.userId !== data.userId);
    this.roomsService.updateRoomInfo(roomIndex, roomInfo);

    this.server.to(roomInfo.roomId).emit('userList', roomInfo.users);
    this.server.to(roomInfo.roomId).emit('exile', data.userId);
  }

  @SubscribeMessage('editRoom')
  editRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: editRoomDto
  ) {
    const roomInfo = this.roomsService.findById(data.id);
    const roomIndex = this.roomsService.findRoomIndex(data.id);

    const newRoomInfo = {
      ...roomInfo,
      ...data,
    };

    const updatedRoomData = this.roomsService.updateRoomInfo(
      roomIndex,
      newRoomInfo
    );
    this.server.to(roomInfo.roomId).emit('updateRoom', updatedRoomData);
  }

  @SubscribeMessage('chatMessage')
  chatMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: chatDto) {
    const user = this.roomsService.findUserById(socket.id);

    this.server.to(data.roomId).emit('newChatMessage', {
      nickName: user.nickName,
      message: data.message,
    });
  }
}

// TODO: 로비랑 룸 모듈 따로 나누기
