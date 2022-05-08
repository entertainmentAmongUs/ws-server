import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { connect, Socket } from 'socket.io-client';
import * as request from 'supertest';
import { AppModule } from '../app.module';

const TEST_URL = 'ws://localhost:8080';

async function createNestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = await moduleFixture.createNestApplication();
  return app;
}

describe('웹소켓 서버 e2e 테스트', () => {
  let user1: Socket, user2: Socket, app: INestApplication;

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

  it('2. 웹소켓 서버가 제대로 연결되었는지 테스트한다.', (done) => {
    user1 = connect(TEST_URL);

    user1.on('connect', () => {
      done();
    });
  });

  it('3. 유저가 로비에 접속하면 로비에 접속중인 유저 목록과 방 목록을 받는다.', (done) => {
    user1 = connect(TEST_URL);
    user1.emit('login', { userId: 1, nickName: '유저1' });

    user1.on('connectedUserList', (data) => {
      done();
    });
  });

  it('4. 로비에 다른 유저가 접속하면 로비에 있는 유저가 접속유저 목록을 받는다.', (done) => {
    user1 = connect(TEST_URL);
    user2 = connect(TEST_URL);

    user1.emit('login', { userId: 1, nickName: '유저1' });
    user2.emit('login', { userId: 2, nickName: '유저2' });

    user1.on('connectedUserList', (data) => {
      if (data.find((user) => user.userId === 2)) {
        done();
      }
    });
  });

  it('5. 로비에 유저가 채팅을 보내면 다른 유저가 채팅을 받는다.', (done) => {
    user1 = connect(TEST_URL);
    user2 = connect(TEST_URL);

    user1.emit('login', { userId: 1, nickName: '유저1' });
    user2.emit('login', { userId: 2, nickName: '유저2' });

    user1.emit('lobbyChatMessage', {
      nickName: '허균',
      message: '안녕하세요.',
    });
    user2.on('newLobbyChatMessage', (data) => {
      done();
    });
  });

  it('6. 유저가 방을 만들면 방이 만들어 지고 로비에 있는 유저에게 방목록이 전달되고, ', () => {});

  afterEach(() => {
    app.close();
  });
});

// TODO: 로비 e2e 테스트 추가
// TODO: 게임 대기방 e2e 테스트 추가
