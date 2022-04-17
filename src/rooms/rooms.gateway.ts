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
import { User } from 'src/users/interfaces/user.interface';
import { Room } from './interfaces/room.interface';
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
  login(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: Omit<User, 'id'>
  ) {
    this.logger.log(`유저가 채널에 접속하였습니다.`);
    this.roomsService.createLobby();
    this.server.socketsJoin(로비.id);
    this.roomsService.join(로비.id, {
      id: socket.id,
      userId: data.userId,
      nickName: data.nickName,
    });

    const currentUserInLobby = this.roomsService.findById(로비.id).users;
    this.logger.log(currentUserInLobby);
    this.server.to(로비.id).emit('connectedUserList', currentUserInLobby);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.id).emit('roomList', roomList);
  }

  @SubscribeMessage('lobbyChatMessage')
  lobbyChat(
    @ConnectedSocket() socket: Socket,
    data: { nickName: string; message: string }
  ) {
    this.server.to(로비.id).emit('newLobbyChatMessage', data);
  }

  @SubscribeMessage('createRoom')
  createRoom(@ConnectedSocket() socket: Socket, data: Room) {
    this.roomsService.create(data);
    this.server.to(로비.id).emit('newRoom', data.id);

    const roomList = this.roomsService.findAll();
    this.server.to(로비.id).emit('roomList', roomList);
  }
}

// TODO: 로비랑 룸 모듈 따로 나누기
