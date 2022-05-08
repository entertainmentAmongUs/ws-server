import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { createNestApp, TEST_URL } from './ws-server.e2e-spec';

describe('로비 접속 테스트', () => {
  let user1: Socket, user2: Socket, app: INestApplication;

  beforeEach(async () => {
    app = await createNestApp();
    await app.init();
    await app.listen(8080);
  });

  it('1. 로비에 접속하면 방 목록을 받는다.', (done) => {
    user1 = connect(TEST_URL);

    user1.on('roomList', (data) => {
      console.log(data);

      done();
    });
  });

  afterEach(() => {
    app.close();
  });
});
