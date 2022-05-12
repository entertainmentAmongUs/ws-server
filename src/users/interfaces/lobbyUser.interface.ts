import { User } from './user.interface';

export interface LobbyUser extends Omit<User, 'socketId'> {}
