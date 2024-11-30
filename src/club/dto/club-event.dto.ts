import { ApiProperty } from '@nestjs/swagger';
import { CityData } from '../../event/type/event-data.type';
import { EventData } from '../../event/type/event-data.type';

export class ClubEventDto {
  @ApiProperty({
    description: '모임 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '모임 주최자 ID',
    type: Number,
  })
  hostId!: number;

  @ApiProperty({
    description: '모임 이름',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '모임 설명',
    type: String,
  })
  description!: string;

  @ApiProperty({
    description: '모임 카테고리 ID',
    type: Number,
  })
  categoryId!: number;

  @ApiProperty({
    description: '모임 도시들',
    type: Object,
    isArray: true,
  })
  eventCity!: CityData[];

  @ApiProperty({
    description: '모임 시작 시간',
    type: Date,
  })
  startTime!: Date;

  @ApiProperty({
    description: '모임 종료 시간',
    type: Date,
  })
  endTime!: Date;

  @ApiProperty({
    description: '최대 인원 수',
    type: Number,
  })
  maxPeople!: number;

  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  clubId!: number;

  static from(event: EventData, clubId: number): ClubEventDto {
    return {
      id: event.id,
      hostId: event.hostId,
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      eventCity: event.eventCity,
      startTime: event.startTime,
      endTime: event.endTime,
      maxPeople: event.maxPeople,
      clubId: clubId,
    };
  }
}
