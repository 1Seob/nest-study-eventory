import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  ArrayNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateEventPayload {
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

  @IsInt({ each: true })
  @ArrayNotEmpty()
  @ApiProperty({
    description: '모임 도시 ID',
    type: [Number],
  })
  cityIds!: number[];

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
