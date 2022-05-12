import { UserDto } from 'src/users/dto/user.dto';

export const TEST_URL = 'ws://localhost:8080';

export const user1Info: UserDto = {
  userId: 1,
  nickName: '허균',
};

export const user2Info: UserDto = {
  userId: 2,
  nickName: '김윤수',
};

export const chatData = {
  roomId: 'LOBBY',
  nickName: '허균',
  message: '안녕하세요',
};

export const createRoomInfo = {
  title: '방1번',
  password: '1234',
  gameType: '라이어게임',
  subject: '안녕하세요',
  maxUser: 2,
  userId: 8,
};
