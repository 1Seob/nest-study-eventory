import { ApiProperty } from '@nestjs/swagger';

export class MemberDto {
  @ApiProperty({
    description: '사용자 ID',
    type: Number,
  })
  userId!: number;

  @ApiProperty({
    description: '클럽 가입 상태',
    type: String,
  })
  status!: string;
}
