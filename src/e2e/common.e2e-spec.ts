import { INestApplication } from '@nestjs/common';
import { Socket } from 'socket.io-client';

describe('공통 테스트', () => {
  let user1: Socket, user2: Socket, app: INestApplication;

  it('1. 유저가 접속을 끊으면 유저가 들어갔던 방에서 나가게 된다.');
});
