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
  namespace: 'room',
  allowEIO3: true,
})
export class RoomsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger(RoomsGateway.name);

  afterInit(nsp: Namespace) {
    this.logger.log(`WS 서버가 초기화되었습니다: ${nsp?.name}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`유저가 접속했습니다: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`유저가 접속을 끊었습니다: ${client.id}`);
  }

  rooms = {};

  @SubscribeMessage('join')
  joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    this.logger.log(`유저가 데이터를 보냈습니다. : ${data}`);
    if (!this.rooms[data]) {
      this.rooms[data] = [socket.id];
    } else {
      this.rooms[data] = [...this.rooms[data], socket.id];
    }
    this.logger.log(this.rooms);
    this.server.socketsJoin(data);
    this.server.to(data).emit('roomCreated', { room: data });
    return { event: 'roomCreated', room: data };
  }

  @SubscribeMessage('chat message')
  sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    this.logger.log(data);
    const roomId = Object.keys(this.rooms).filter((key) =>
      this.rooms[key].includes(socket.id)
    );

    this.logger.log(roomId);

    this.server.to(roomId).emit('chat message', { message: data });
  }

  @SubscribeMessage('leave')
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: string) {
    this.logger.log(data);
    if (this.rooms[data]) {
      this.rooms[data] = this.rooms[data].filter(
        (room) => room.id !== socket.id
      );

      this.server.socketsLeave(data);
    }

    this.logger.log('해당 유저가 떠날 방은 존재하지 않습니다.');
  }
}
