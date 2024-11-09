import { ApiProperty } from '@nestjs/swagger';
import { EventData } from '../type/event-data.type';

export class EventDto {
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
    description: '모임 도시 ID',
    type: Number,
  })
  cityId!: number;

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

  static from(event: EventData): EventDto {
    return {
      id: event.id,
      hostId: event.hostId,
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      cityId: event.cityId,
      startTime: event.startTime,
      endTime: event.endTime,
      maxPeople: event.maxPeople,
    };
  }

  static fromArray(events: EventData[]): EventDto[] {
    return events.map((event) => this.from(event));
  }
}

export class EventListDto {
  @ApiProperty({
    description: '모임 리스트',
    type: [EventDto],
  })
  events!: EventDto[];

  static from(events: EventData[]): EventListDto {
    return {
      events: EventDto.fromArray(events),
    };
  }
}
