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
import { AsyncApiPub, AsyncApiService, AsyncApiSub } from 'nestjs-asyncapi';
import { Namespace, Server, Socket } from 'socket.io';
import { User } from 'src/users/interfaces/user.interface';
import { createRoomDto, RoomDto } from './dtos/room.dto';
import { LoginDto, UserDto } from './dtos/user.dto';
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
    this.roomsService.leaveBySocketId(client.id);
  }

  @SubscribeMessage('login')
  @AsyncApiSub({
    channel: 'login',
    summary: '로그인',
    description: '로비에 해당 유저를 추가합니다.',
    message: {
      name: '클라이언트는 로비 접속을 위해 해당 데이터를 보냅니다.',
      payload: {
        type: LoginDto,
      },
    },
  })
  @AsyncApiPub(
    {
      channel: 'login',
      summary: '로그인',
      operationId: 'connectedUserList',
      description: '로비에 해당 유저를 추가합니다.',
      message: {
        name: '로비에 접속한 유저들에게 현재 방에 접속한 유저들의 리스트를 줍니다.',
        payload: {
          type: UserDto,
        },
      },
    },
    {
      channel: 'login',
      summary: '로그인',
      operationId: 'roomList',
      description: '로비에 해당 유저를 추가합니다.',
      message: {
        name: '로비에 접속한 유저들에게 현재 방에 접속한 방의 리스트를 줍니다.',
        payload: {
          type: RoomDto,
        },
      },
    }
  )
  login(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: Omit<User, 'id'>
  ) {
    this.logger.log(`유저가 채널에 접속하였습니다.`);
    this.roomsService.createLobby();
    this.server.socketsJoin(로비.id);

    const newUser = {
      id: socket.id,
      userId: data.userId,
      nickName: data.nickName,
      isReady: false,
      isHost: false,
    };

    this.roomsService.createUser(newUser);
    this.roomsService.joinLobby(로비.id, newUser);

    const currentUserInLobby = this.roomsService.findById(로비.id).users;
    this.logger.log(currentUserInLobby);
    this.server.to(로비.id).emit('connectedUserList', currentUserInLobby);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.id).emit('roomList', roomList);
  }

  @SubscribeMessage('lobbyChatMessage')
  lobbyChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { nickName: string; message: string }
  ) {
    this.logger.log('채팅 메시지를 보냈습니다.');
    this.logger.log(data);
    this.server.to(로비.id).emit('newLobbyChatMessage', data);
  }

  @SubscribeMessage('createRoom')
  createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: createRoomDto
  ) {
    const newRoom = this.roomsService.create(data);

    const user = {
      isHost: true,
      isReady: false,
      ...this.roomsService.findUserById(socket.id),
    };
    this.roomsService.join(newRoom.id, user);

    this.server.to(로비.id).emit('newRoom', newRoom.id);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.id).emit('roomList', roomList);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: RoomDto['id'] }
  ) {
    const room = this.roomsService.findById(data.roomId);
    const user = {
      isHost: false,
      isReady: false,
      ...this.roomsService.findUserById(socket.id),
    };
    const updatedRoom = this.roomsService.join(room.id, user);

    this.server.to(room.id).emit('userList', updatedRoom.users);
  }

  @SubscribeMessage('getReady')
  getReady(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: UserDto['id']
  ) {
    const roomIndex = this.roomsService.findByUserSocketId(socket.id);

    const roomInfo = this.roomsService.updateUserReadyStatus(
      roomIndex,
      socket.id
    );

    this.server.to(roomInfo.id).emit('userList', roomInfo.users);

    if (roomInfo.users.every((user) => user.isReady)) {
      const order = Array()
        .fill(roomInfo.users.length)
        .map((_, i) => {
          return i;
        });

      this.server.to(roomInfo.id).emit('startGame', {
        keyword: '닭꼬치',
        time: '180',
        order,
        liarNumber: 0,
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data) {}

  @SubscribeMessage('kick')
  kick(@ConnectedSocket() socket: Socket, @MessageBody() data) {}

  @SubscribeMessage('editRoom')
  editRoom(@ConnectedSocket() socket: Socket, @MessageBody() data) {}

  @SubscribeMessage('chatMessage')
  chatMessage(@ConnectedSocket() socket: Socket, @MessageBody() data) {}
}

// TODO: 로비랑 룸 모듈 따로 나누기
