import {
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserPayload {
  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: '이메일',
    type: String,
  })
  email?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '이름',
    type: String,
  })
  name?: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '생일',
    type: Date,
    nullable: true,
  })
  birthday?: Date | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '도시 ID',
    type: Number,
    nullable: true,
  })
  cityId?: number | null;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '카테고리 ID',
    type: Number,
  })
  categoryId?: number | null;
}
