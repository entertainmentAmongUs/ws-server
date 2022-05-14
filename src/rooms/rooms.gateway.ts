import { Logger, UseInterceptors, UsePipes } from '@nestjs/common';
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
import { 라이어게임_제시어 } from 'src/constant/subject';
import { LoggingInterceptor } from 'src/core/interceptors/logging.interceptor';
import { WSValidationPipe } from 'src/pipe/ws-validation-pipe';
import { KickDto, UserDto } from 'src/users/dto/user.dto';
import { ChatDto } from './dtos/chat.dto';
import {
  CreateRoomDto,
  EditRoomDto,
  GetReadyDto,
  JoinRoomDto,
  LeaveRoomDto,
  RoomInfoDto,
} from './dtos/room.dto';
import { RoomsService, 로비 } from './rooms.service';

@AsyncApiService()
@UseInterceptors(new LoggingInterceptor())
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

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('joinLobby')
  joinLobby(@ConnectedSocket() socket: Socket, @MessageBody() data: UserDto) {
    this.server.in(socket.id).socketsJoin(로비.roomId);

    const newUser = {
      socketId: socket.id,
      userId: data.userId,
      nickName: data.nickName,
    };

    this.roomsService.createUser(newUser);
    this.roomsService.joinLobby(newUser);

    const lobbyUserList = this.roomsService.findLobby().users.map((user) => {
      return {
        userId: user.userId,
        nickName: user.nickName,
      };
    });
    this.server.to(로비.roomId).emit('lobbyUserList', { users: lobbyUserList });

    const roomList = this.roomsService.findAll();
    this.server.to(로비.roomId).emit('roomList', { roomList });
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('chat')
  lobbyChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: ChatDto
  ) {
    this.server.to(data.roomId).emit('chat', data);
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: CreateRoomDto
  ) {
    const { userId, ...roomInfo } = data;
    const newRoom = this.roomsService.create(roomInfo);

    const user = {
      ...this.roomsService.findUserBySocketId(socket.id),
      isReady: false,
    };
    this.server.in(socket.id).socketsJoin(newRoom.roomId);
    this.roomsService.join(newRoom.roomId, user);

    this.server.to(socket.id).emit('createRoom', { roomId: newRoom.roomId });
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: JoinRoomDto
  ) {
    const room = this.roomsService.findById(data.roomId);
    const user = {
      ...this.roomsService.findUserBySocketId(socket.id),
      isReady: false,
    };

    // 방정보가 없을 때
    if (!room) {
      this.server.to(socket.id).emit('joinRoom', { status: 'UN_EXIST' });
      return;
    }

    // 패스워드가 다를 때
    if (room.password && room.password !== data.password) {
      this.server
        .to(socket.id)
        .emit('joinRoom', { status: 'PASSWORD_INCORRECT' });
      return;
    }

    // 유저가 꽉 찼을 때
    if (room.maxUser === room.users.length) {
      this.server.to(socket.id).emit('joinRoom', { status: 'FULL_USER' });
      return;
    }

    // 유저가 모두 레디해서 시작했을 때
    if (
      room.users.length >= 3 &&
      room.users.every((user) => user.isReady === true)
    ) {
      this.server.to(socket.id).emit('joinRoom', { status: 'ALREADY_STARTED' });
      return;
    }

    this.server.in(socket.id).socketsJoin(data.roomId);
    const updatedRoom = this.roomsService.join(room.roomId, user);

    this.server.to(socket.id).emit('joinRoom', { status: 'SUCCESS' });
    this.server
      .to(room.roomId)
      .emit('roomInfo', this.roomsService.transferRoomInfoData(updatedRoom));
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('roomList')
  roomList(@ConnectedSocket() socket: Socket) {
    const roomList = this.roomsService.findAll().map((room) => {
      return {
        ...room,
        users: room.users.map(({ socketId, ...user }) => {
          return user;
        }),
      };
    });
    this.server.to(socket.id).emit('roomList', { roomList });
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('roomInfo')
  roomInfo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: RoomInfoDto
  ) {
    const roomInfo = this.roomsService.findById(data.roomId);

    this.server
      .to(socket.id)
      .emit('roomInfo', this.roomsService.transferRoomInfoData(roomInfo));
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('getReady')
  getReady(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: GetReadyDto
  ) {
    const roomInfo = this.roomsService.updateUserReadyStatus(
      data.roomId,
      data.userId
    );
    const filterUserList = roomInfo.users.map(({ socketId, ...user }) => {
      return user;
    });

    this.server.to(roomInfo.roomId).emit('userList', filterUserList);

    if (
      roomInfo.users.length >= 3 &&
      roomInfo.users.every((user) => user.isReady)
    ) {
      const order = Array()
        .fill(roomInfo.users.length)
        .map((_, i) => {
          return i;
        });

      const rand = Math.floor(
        Math.random() * 라이어게임_제시어[roomInfo.subject].length
      );
      this.roomsService.startRoom(roomInfo.roomId);
      this.server.to(roomInfo.roomId).emit('startGame', {
        keyword: 라이어게임_제시어[roomInfo.subject][rand],
        time: '180',
        order: shuffleArray(order),
        liarNumber: 0,
      });
    }
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('leaveRoom')
  leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: LeaveRoomDto
  ) {
    this.server.in(socket.id).socketsLeave(data.roomId);
    this.roomsService.leaveRoom(data.roomId, data.userId);

    const roomInfo = this.roomsService.findById(data.roomId);
    if (roomInfo) {
      this.server
        .to(roomInfo.roomId)
        .emit('roomInfo', this.roomsService.transferRoomInfoData(roomInfo));
    }
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('kick')
  kick(@ConnectedSocket() socket: Socket, @MessageBody() data: KickDto) {
    const kickUserSocketId = this.roomsService.findUserByUserId(
      data.userId
    ).socketId;

    this.server.to(data.roomId).emit('kick', { userId: data.userId });
    this.roomsService.kick(data.roomId, data.userId);
    this.server.in(kickUserSocketId).socketsLeave(data.roomId);

    const roomInfo = this.roomsService.findById(data.roomId);
    this.server
      .to(data.roomId)
      .emit('roomInfo', this.roomsService.transferRoomInfoData(roomInfo));
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('editRoom')
  editRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: EditRoomDto
  ) {
    const roomInfo = this.roomsService.findById(data.roomId);
    const roomIndex = this.roomsService.findRoomIndex(data.roomId);

    const newRoomInfo = {
      ...roomInfo,
      ...data,
    };

    // 최대 인원수가 현재 인원수보다 적으면 불가능하다는 메시지
    if (newRoomInfo.maxUser < roomInfo.users.length) {
      this.server.to(socket.id).emit('editRoom', { status: 'OVER_COUNT' });
      return;
    }

    const updatedRoomInfo = this.roomsService.updateRoomInfo(
      roomIndex,
      newRoomInfo
    );
    this.server
      .to(roomInfo.roomId)
      .emit(
        'roomInfo',
        this.roomsService.transferRoomInfoData(updatedRoomInfo)
      );
  }

  @UsePipes(new WSValidationPipe())
  @SubscribeMessage('chatMessage')
  chatMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatDto) {
    const user = this.roomsService.findUserBySocketId(socket.id);

    this.server.to(data.roomId).emit('newChatMessage', {
      nickName: user.nickName,
      message: data.message,
      roomId: data.roomId,
    });
  }
}

// TODO: 로비랑 룸 모듈 따로 나누기
