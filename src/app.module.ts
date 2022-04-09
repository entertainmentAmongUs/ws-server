import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [CoreModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
