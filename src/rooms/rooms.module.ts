import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { RoomSchema } from './schemas/room.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }])],
  providers: [RoomsGateway, RoomsService],
})
export class RoomsModule {}
