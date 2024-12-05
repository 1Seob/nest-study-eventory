import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ClubQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: '클럽장 ID',
    type: Number,
  })
  hostId?: number;

  @IsOptional()
  @IsString()
  @Type(() => String)
  @ApiPropertyOptional({
    description: '클럽 이름',
    type: String,
  })
  title?: string;
}
