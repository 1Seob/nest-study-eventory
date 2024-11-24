import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '모임 도시 ID',
    type: [Number],
  })
  cityIds?: number[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '모임 카테고리 ID',
    type: Number,
  })
  categoryId?: number;
}
