import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class JoinEventPayload {
  @IsInt()
  @ApiProperty({
    description: '모임 참가자 ID',
    type: Number,
  })
  userId!: number;
}
