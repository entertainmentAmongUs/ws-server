import { INestApplication } from '@nestjs/common';
import { connect, Socket } from 'socket.io-client';
import { UserDto } from 'src/users/dto/user.dto';
import { createNestApp, TEST_URL } from './ws-server.e2e-spec';

const user1Info: UserDto = {
  userId: 'user1',
  nickName: '허균',
};

const user2Info: UserDto = {
  userId: 'user2',
  nickName: '김윤수',
};

const chatData = {
  roomId: 'LOBBY',
  nickName: '허균',
  message: '안녕하세요',
};

const createRoomInfo = {
  title: '방1번',
  password: '1234',
  gameType: '라이어게임',
  subject: '안녕하세요',
  maxUser: 2,
  userId: 8,
};

describe('로비 테스트', () => {
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

  it('1. 최초에 로비에 접속하면 빈 방 목록을 받는다.', (done) => {
    user1.emit('joinLobby', user1Info);
    user1.on('roomList', (data) => {
      expect(data).toEqual({ roomList: [] });
      done();
    });
  });

  it('2. 로비에 접속하면 로비에 접속해있는 유저 목록을 받는다', (done) => {
    user1.emit('joinLobby', user1Info);
    user1.on('lobbyUserList', (data) => {
      expect(data).toMatchObject({
        users: expect.arrayContaining([expect.objectContaining(user1Info)]),
      });
      done();
    });
  });

  it('3. 로비에 접속한 유저가 로비에 채팅을 보내면 로비에 접속한 다른 유저가 채팅을 받는다', (done) => {
    user1.emit('joinLobby', user1Info);
    user2.emit('joinLobby', user2Info);

    user1.emit('chat', chatData);
    user2.on('chat', (data) => {
      expect(data).toEqual(chatData);
      done();
    });
  });

  it('4. 방을 만들면 방 아이디를 받는다.', (done) => {
    user1.emit('createRoom', createRoomInfo);
    user1.on('createRoom', (data) => {
      expect(data).toMatchObject({ roomId: expect.any(String) });
      done();
    });
  });

  it('5. 방이 만들어져 있을 때 방목록을 가져오면 방목록이 들어있다.', (done) => {
    user2.emit('roomList');
    user2.on('roomList', (data) => {
      expect(data).toMatchObject({
        roomList: expect.arrayContaining([
          {
            roomId: expect.any(String),
            maxUser: expect.any(Number),
            title: expect.any(String),
            password: expect.any(String),
            users: expect.any(Object),
            gameType: expect.any(String),
            subject: expect.any(String),
          },
        ]),
      });
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
