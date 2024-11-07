import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateEventPayload {
  @IsInt()
  @ApiProperty({
    description: '모임 주최자 ID',
    type: Number,
  })
  hostId!: number;

  @IsString()
  @ApiProperty({
    description: '모임 이름',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '모임 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @ApiProperty({
    description: '모임 카테고리 ID',
    type: Number,
  })
  categoryId!: number;

  @IsInt()
  @ApiProperty({
    description: '모임 도시 ID',
    type: Number,
  })
  cityId!: number;

  @IsDateString()
  @ApiProperty({
    description: '모임 시작 시간',
    type: Date,
  })
  startTime!: Date;

  @IsDateString()
  @ApiProperty({
    description: '모임 종료 시간',
    type: Date,
  })
  endTime!: Date;

  @IsInt()
  @ApiProperty({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople!: number;
}

export class CreateJoinEventPayload {
  @IsInt()
  @ApiProperty({
    description: '모임 참가자 ID',
    type: Number,
  })
  userId!: number;
}

export class CreateOutEventPayload {
  @IsInt()
  @ApiProperty({
    description: '모임 탈퇴자 ID',
    type: Number,
  })
  userId!: number;
}
