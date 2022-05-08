import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { connect, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../app.module';

export const TEST_URL = 'ws://localhost:8080';

export async function createNestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = await moduleFixture.createNestApplication();
  return app;
}

describe('웹소켓 서버 e2e 테스트', () => {
  let user1: Socket, user2: Socket, app: INestApplication;

  beforeAll(async () => {
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

  it('2. 웹소켓 서버가 제대로 연결되었는지 테스트한다.', (done) => {
    user1 = connect(TEST_URL);

    user1.on('connect', () => {
      done();
    });
  });

  afterAll(() => {
    app.close();
    user1.close();
  });
});

// TODO: 로비 e2e 테스트 추가
// TODO: 게임 대기방 e2e 테스트 추가
