import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(8080, { cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat message')
  onEvent(client: any, message: any) {
    console.log('이벤트를 받았다!');
    this.server.emit('chat message', { id: client.id, message });
  }
}
