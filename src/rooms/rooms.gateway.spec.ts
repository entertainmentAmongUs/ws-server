import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';

describe('ws-server 단위 테스트', () => {
  let roomsGateway: RoomsGateway;
  let roomsService: RoomsService;

  beforeEach(() => {
    roomsService = new RoomsService();
    roomsGateway = new RoomsGateway(roomsService);
  });

  describe('createUser', () => {
    it('유저를 생성하면 user배열에 들어간다.', async () => {
      const user = { userId: 1, nickName: 'user1', socketId: '1' };

      expect(await roomsService.createUser(user)).toEqual([user]);
    });
  });

  describe('findUserBySocketId', () => {
    it('유저를 찾아서 유저가 있으면 반환한다.', async () => {
      const user = { userId: 1, nickName: 'user1', socketId: '1' };
      roomsService.createUser(user);

      expect(await roomsService.findUserBySocketId(user.socketId)).toEqual(
        user
      );
    });

    it('유저를 찾는데 유저가 없다면 undefined를 반환한다.', async () => {
      expect(await roomsService.findUserBySocketId('1')).toBeUndefined();
    });
  });

  describe('joinLobby', () => {
    it('로비에 유저를 추가한다.', async () => {
      const user = { userId: 1, nickName: 'user1', socketId: '1' };

      await roomsService.joinLobby(user);
    });
  });
});
