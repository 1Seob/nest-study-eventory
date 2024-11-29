import { ApiProperty } from '@nestjs/swagger';

export class ClubReviewDto {
  @ApiProperty({
    description: '리뷰 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '모임 ID',
    type: Number,
  })
  eventId!: number;

  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  userId!: number;

  @ApiProperty({
    description: '별점',
    type: Number,
  })
  score!: number;

  @ApiProperty({
    description: '리뷰 제목',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '리뷰 내용',
    type: String,
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  clubId!: number;
}
