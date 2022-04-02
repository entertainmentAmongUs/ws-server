import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  AsyncApiDocumentBuilder,
  AsyncApiModule,
  AsyncServerObject,
} from 'nestjs-asyncapi';
import 'source-map-support/register';
import { AppModule } from './app.module';

const port = 8080;
const host = '0.0.0.0';
const docRelPath = '/api';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const asyncApiServer: AsyncServerObject = {
    url: 'ws://localhost:8080',
    protocol: 'socket.io',
    protocolVersion: '4',
    description: 'websocket 프로토콜을 이용해 해당 서버에 접속할 수 있습니다.',
    security: [{ 'user-password': [] }],
    variables: {
      port: {
        description: '현재 TLS 연결은 불가능 합니다.',
        default: '443',
      },
    },
    bindings: {},
  };

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Entertainment AmongUs Websocket API')
    .setDescription('socket.io 관련 api는 아래를 참조하세요.')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .addServer('cats-server', asyncApiServer)
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(
    app,
    asyncApiOptions
  );
  await AsyncApiModule.setup(docRelPath, app, asyncapiDocument);

  app.listen(port, host);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

const baseUrl = `http://${host}:${port}`;
const startMessage = `Server started at ${baseUrl}; AsyncApi at ${
  baseUrl + docRelPath
};`;

bootstrap().then(() => console.log(startMessage));
