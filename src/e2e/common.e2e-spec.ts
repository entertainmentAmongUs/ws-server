import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { TEST_URL } from './e2e.mocking';
import { createNestApp } from './ws-server.e2e-spec';

describe('공통 테스트', () => {
  let user1: Socket, user2: Socket, app: INestApplication;

  beforeAll(async () => {
    app = await createNestApp();
    await app.init();
    await app.listen(8080);
  });

  beforeEach(() => {
    user1 = connect(TEST_URL);
    user2 = connect(TEST_URL);
  });

  it('1. 유저가 접속을 끊으면 유저가 들어갔던 방에서 나가게 된다.', (done) => {
    done();
  });

  afterEach(() => {
    user1.close();
    user2.close();
  });

  afterAll(() => {
    app.close();
  });
});
