import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { createRoomInfo, TEST_URL, user1Info, user2Info } from './e2e.mocking';
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

  it('3. 방에 있는 유저 중 한명이 나가면 남은 사람에게 갱신된 방정보를 보내준다.', (done) => {
    let roomId;
    user1.emit('joinLobby', user1Info);
    user2.emit('joinLobby', user2Info);

    user1.emit('createRoom', createRoomInfo);
    user2.emit('roomList');

    user2.on('roomList', (data) => {
      console.log(data);
      roomId = data.roomList[0].roomId;
      console.log(roomId);
      user2.emit('joinRoom', { roomId: roomId, userId: user2Info.userId });
      user1.emit('leaveRoom', { roomId, userId: user1Info.userId });
    });

    user2.on('roomInfo', (data) => {
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
  });
});
