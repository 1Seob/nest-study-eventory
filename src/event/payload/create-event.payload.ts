import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  ArrayNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { CityData } from '../type/create-event-data.type';

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

  @ArrayNotEmpty()
  @ApiProperty({
    description: '모임 도시들',
    type: Object,
    isArray: true,
  })
  eventCity!: CityData[];

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
  @Min(1)
  @ApiProperty({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople!: number;
}
