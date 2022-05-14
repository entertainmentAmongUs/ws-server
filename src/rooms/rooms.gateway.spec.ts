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
      jest.spyOn(roomsService, 'createUser').mockImplementation(() => [user]);

      expect(await roomsService.createUser(user)).toEqual([user]);
    });
  });
});
