import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateClubPayload {
  @IsString()
  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople!: number;
}
