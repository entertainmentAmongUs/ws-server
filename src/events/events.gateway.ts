import { Logger } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
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
import { Namespace, Server } from 'socket.io';
import { Socket } from 'socket.io-client';

class TestEventsDto {
  @ApiProperty()
  readonly name: string;
}

@AsyncApiService()
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger(EventsGateway.name);

  afterInit(nsp: Namespace) {
    this.logger.log(`WS 서버가 초기화되었습니다: ${nsp?.name}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`유저가 접속했습니다: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`유저가 접속을 끊었습니다: ${client.id}`);
  }

  @SubscribeMessage('test')
  @AsyncApiPub({
    channel: 'test',
    summary: '패킷 전송을 테스트합니다.',
    description: '이 메소드는 테스트를 위해 사용됩니다.',
    message: {
      name: 'test data',
      payload: {
        type: TestEventsDto,
      },
    },
  })
  test(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.logger.log(`유저 아이디 ${client.id} : ${JSON.stringify(data)}`);
    this.server.emit('test', { id: client.id, message: data });
  }

  @AsyncApiSub({
    channel: 'signal',
    summary: 'signal packet을 읽습니다.',
    description: '이 메소드는 테스트를 위해 사용됩니다.',
    message: {
      name: 'test data signal',
      payload: {
        type: TestEventsDto,
      },
    },
  })
  async emitSignal(boardUUID: string, data: Record<string, any>) {
    this.server.to('test').emit('signal', data);
  }
}
