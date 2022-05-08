import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { UserDto } from 'src/users/dto/user.dto';
import { createNestApp, TEST_URL } from './ws-server.e2e-spec';

const user1Info: UserDto = {
  userId: 'user1',
  nickName: '허균',
};

describe('로비 접속 테스트', () => {
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

  it('1. 로비에 접속하면 방 목록을 받는다.', (done) => {
    user1.emit('joinLobby', user1Info);
    user1.on('roomList', (data) => {
      console.log(data);
      done();
    });
  });

  it('2. 로비에 접속하면 로비에 접속해있는 유저 목록을 받는다', (done) => {
    user1.emit('joinLobby', user1Info);
    user1.on('lobbyUserList', (data) => {
      console.log(data);
      done();
    });
  });

  afterEach(() => {
    user1.close();
    user2.close();
  });

  afterAll(() => {
    app.close();
    user1.close();
    user2.close();
  });
});
