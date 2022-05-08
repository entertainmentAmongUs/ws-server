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
import { chatDto, createRoomDto, editRoomDto, RoomDto } from './dtos/room.dto';
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
    // TODO: 유저가 접속한 모든 방에서 로그아웃
    if (!this.roomsService.findById(client.id)) {
      this.roomsService.leaveBySocketId(client.id);
    }
  }

  @SubscribeMessage('joinLobby')
  login(@ConnectedSocket() socket: Socket, @MessageBody() data: UserDto) {
    this.roomsService.createLobby();
    this.server.socketsJoin(로비.roomId);

    const newUser = {
      id: socket.id,
      userId: data.userId,
      nickName: data.nickName,
      isReady: false,
    };

    this.roomsService.createUser(newUser);
    this.roomsService.joinLobby(로비.roomId, newUser);

    const lobbyUserList = this.roomsService.findById(로비.roomId).users;
    this.server.to(로비.roomId).emit('lobbyUserList', lobbyUserList);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.roomId).emit('roomList', { roomList });
  }

  @SubscribeMessage('lobbyChatMessage')
  lobbyChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { nickName: string; message: string }
  ) {
    this.logger.log('채팅 메시지를 보냈습니다.');
    this.logger.log(data);
    this.server.to(로비.roomId).emit('newLobbyChatMessage', data);
  }

  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: createRoomDto
  ) {
    const newRoom = this.roomsService.create(data);

    const user = {
      ...this.roomsService.findUserById(socket.id),
      isHost: true,
      isReady: false,
    };
    this.server.socketsJoin(newRoom.roomId);
    this.roomsService.join(newRoom.roomId, user);

    this.server.to(로비.roomId).emit('newRoom', newRoom.roomId);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.roomId).emit('roomList', roomList);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: RoomDto['roomId'] }
  ) {
    const room = this.roomsService.findById(data.roomId);
    const user = {
      ...this.roomsService.findUserById(socket.id),
      isHost: false,
      isReady: false,
    };
    this.server.socketsJoin(data.roomId);
    const updatedRoom = this.roomsService.join(room.roomId, user);

    this.server.to(room.roomId).emit('userList', updatedRoom.users);
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
      roomInfo.users.findIndex((user) => user.id === socket.id) === 0 &&
      roomInfo.users.length > 1
    ) {
      // roomInfo.users[1].isHost = true;
    }

    roomInfo.users.filter((user) => user.id !== socket.id);
    this.roomsService.updateRoomInfo(roomIndex, roomInfo);

    this.server.to(roomInfo.roomId).emit('userList', roomInfo.users);
  }

  @SubscribeMessage('kick')
  kick(@ConnectedSocket() socket: Socket, @MessageBody() data: KickDto) {
    const roomIndex = this.roomsService.findByUserSocketId(socket.id);
    const roomInfo = this.roomsService.findRoomInfoByRoomIndex(roomIndex);

    this.server.socketsLeave(roomInfo.roomId);
    roomInfo.users.filter((user) => user.id !== data.userId);
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
