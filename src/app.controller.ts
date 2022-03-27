import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('test')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'test용 api 입니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  getHello(): string {
    return this.appService.getHello();
  }
}
