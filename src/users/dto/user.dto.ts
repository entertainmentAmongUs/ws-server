import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  readonly socketId: string;
  @ApiProperty()
  readonly userId: string;
  @ApiProperty()
  readonly nickName: string;
}

export class UserDto extends OmitType(User, ['socketId']) {}

export class KickDto extends PickType(UserDto, ['userId']) {}
