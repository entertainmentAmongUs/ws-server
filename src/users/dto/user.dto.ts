import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  readonly socketId: String;
  @ApiProperty()
  readonly userId: String;
  @ApiProperty()
  readonly nickName: String;
}

export class UserDto extends OmitType(User, ['socketId']) {}

export class KickDto extends PickType(UserDto, ['userId']) {}
