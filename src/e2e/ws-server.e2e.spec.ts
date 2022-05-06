import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { connect } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../app.module';

async function createNestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = await moduleFixture.createNestApplication();
  return app;
}

describe('웹소켓 서버 e2e 테스트', () => {
  let clientSocket1, clientSocket2, app;

  beforeEach(async () => {
    app = await createNestApp();
    await app.init();
    await app.listen(8080);
  });

  it('1. 웹소켓 서버가 제대로 켜졌는지 테스트한다.', async () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ data: 'Hello World!' });
  });

  it(`2. 웹소켓 서버가 제대로 연결되었는지 테스트해본다.`, async () => {
    clientSocket1 = connect('ws://localhost:8080');
    await new Promise((resolve) => {
      clientSocket1.on('connect', () => {
        console.log('소켓이 연결되었습니다.');
      });
      return resolve(true);
    });
  });

  afterEach(() => {
    app.close();
  });
});
