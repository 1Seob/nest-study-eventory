import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class OutEventPayload {
  @IsInt()
  @ApiProperty({
    description: '모임 탈퇴자 ID',
    type: Number,
  })
  userId!: number;
}
