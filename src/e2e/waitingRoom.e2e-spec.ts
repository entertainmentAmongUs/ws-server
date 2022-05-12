import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { createRoomInfo, TEST_URL, user1Info } from './e2e.mocking';
import { createNestApp } from './ws-server.e2e-spec';

describe('대기방 테스트', () => {
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

  it('1. 방 정보를 가져오고 싶을 때 roomId에 해당하는 방 정보를 가져온다.', (done) => {
    user1.emit('joinLobby', user1Info);
    user1.emit('createRoom', createRoomInfo);

    user1.on('createRoom', (data) => {
      const roomId = data.roomId;

      user1.emit('roomInfo', { roomId });
    });
    user1.on('roomInfo', (data) => {
      console.log(data);
      done();
    });
  });

  it('2. 방에 있는 유저가 방에서 disconnect하면 방에 있는 유저들에게 유저리스트를 보내준다.', (done) => {
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
