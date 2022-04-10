import { Injectable } from '@nestjs/common';
import { Room } from './interfaces/room.interface';

@Injectable()
export class RoomsService {
  constructor() {
    const rooms: Room[] = [];
  }

  create() {}

  join() {}

  findById() {}

  addMessage() {}

  findAll() {}

  update() {}

  delete() {}
}
