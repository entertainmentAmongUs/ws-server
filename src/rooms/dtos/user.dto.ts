import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  readonly id: String;
  @ApiProperty()
  readonly userId: String;
  @ApiProperty()
  readonly nickName: String;
}

export class LoginDto extends OmitType(UserDto, ['id']) {}
