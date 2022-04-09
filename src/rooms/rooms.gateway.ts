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
import { Namespace, Server } from 'socket.io';
import { Socket } from 'socket.io-client';

// class RoomEventsDto {
//   @ApiProperty()
//   readonly message: string;
// }

@WebSocketGateway({
  cors: { origin: '*' },
  Namespace: '/room',
  allowEIO3: true,
})
export class RoomsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger(RoomsGateway.name);

  rooms = {};

  afterInit(nsp: Namespace) {
    this.logger.log(`WS 서버가 초기화되었습니다: ${nsp?.name}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`유저가 접속했습니다: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`유저가 접속했습니다: ${client.id}`);
  }

  @SubscribeMessage('join')
  joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    console.log(data);
    if (this.rooms[data]) {
      this.rooms[data].push(socket);
    } else {
      this.rooms[data] = socket.id;
    }
    console.log(this.rooms);
    this.server.socketsJoin(data);
    this.server.to(data).emit('roomCreated', { room: data });
    return { event: 'roomCreated', room: data };
  }

  @SubscribeMessage('send')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    const roomId = Object.keys(this.rooms).find(
      (room) => this.rooms[room] === socket.id
    );

    this.server.to(roomId).emit('message', { message: data });
  }

  @SubscribeMessage('leave')
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    console.log(data);
    if (this.rooms[data]) {
      this.rooms[data] = this.rooms[data].filter(
        (room) => room.id !== socket.id
      );

      this.server.socketsLeave(data);
    }

    console.log('해당 유저가 떠날 방은 존재하지 않습니다.');
  }
}