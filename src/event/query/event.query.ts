import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CityData } from '../type/create-event-data.type';

export class EventQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '모임 주최자 ID',
    type: Number,
  })
  hostId?: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: '모임 도시들 ID',
    type: Object,
    isArray: true,
  })
  cityId?: CityData[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '모임 카테고리 ID',
    type: Number,
  })
  categoryId?: number;
}
