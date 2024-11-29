import { ApiProperty } from '@nestjs/swagger';
import { ClubData, MemberData } from '../type/club-data.type';

export class ClubDto {
  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '클럽장 ID',
    type: Number,
  })
  hostId!: number;

  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @ApiProperty({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople!: number;

  @ApiProperty({
    description: '클럽 멤버들',
    type: Object,
    isArray: true,
  })
  members!: MemberData[];

  static from(club: ClubData): ClubDto {
    return {
      id: club.id,
      hostId: club.hostId,
      title: club.title,
      description: club.description,
      maxPeople: club.maxPeople,
      members: club.members.map((member) => ({
        userId: member.userId,
        status: member.status,
      })),
    };
  }

  static fromArray(clubs: ClubData[]): ClubDto[] {
    return clubs.map((club) => this.from(club));
  }
}

export class ClubListDto {
  @ApiProperty({
    description: '클럽 리스트',
    type: [ClubDto],
  })
  clubs!: ClubDto[];

  static from(clubs: ClubData[]): ClubListDto {
    return {
      clubs: ClubDto.fromArray(clubs),
    };
  }
}
