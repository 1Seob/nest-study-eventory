import {
  IsDate,
  IsInt,
  ArrayNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CityData } from '../type/create-event-data.type';

export class PatchUpdateEventPaylaod {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '모임 이름',
    type: String,
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '모임 설명',
    type: String,
  })
  description?: string | null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: '모임 카테고리 ID',
    type: Number,
  })
  categoryId?: number | null;

  @IsOptional()
  @ArrayNotEmpty()
  @ApiPropertyOptional({
    description: '모임 도시들',
    type: Object,
    isArray: true,
  })
  eventCity?: CityData[] | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: '모임 시작 시간',
    type: Date,
  })
  startTime?: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: '모임 종료 시간',
    type: Date,
  })
  endTime?: Date | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople?: number | null;
}
