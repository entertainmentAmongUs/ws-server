import { User } from './user.interface';

export interface RoomInUser extends User {
  isReady: boolean;
}
