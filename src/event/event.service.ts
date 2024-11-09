import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { JoinEventPayload } from './payload/join-event.payload';
import { OutEventPayload } from './payload/out-event.payload';
import { PatchUpdateEventPaylaod } from './payload/patch-update-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventQuery } from './query/event.query';
import { CreateEventData } from './type/create-event-data.type';
import { JoinEventData } from './type/join-event-data.type';
import { OutEventData } from './type/out-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    const createData: CreateEventData = {
      hostId: payload.hostId,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const host = await this.eventRepository.getUserById(payload.hostId);
    if (!host) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }

    const category = await this.eventRepository.getCategoryById(
      payload.categoryId,
    );
    if (!category) {
      throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
    }

    const city = await this.eventRepository.getCityById(payload.cityId);
    if (!city) {
      throw new NotFoundException('해당 도시를 찾을 수 없습니다.');
    }

    if (createData.endTime < createData.startTime) {
      throw new ConflictException(
        '모임 시작 시간이 종료 시간보다 늦을 수 없습니다.',
      );
    }
    if (new Date() > createData.startTime) {
      throw new ConflictException(
        '모임 시작 시간이 현재 시간보다 늦어야 합니다.',
      );
    }

    const event = await this.eventRepository.createEvent(createData);
    return EventDto.from(event);
  }

  async getEvents(query: EventQuery): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);
    return EventListDto.from(events);
  }

  async getEventById(eventId: number): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    return EventDto.from(event);
  }

  async joinEvent(eventId: number, payload: JoinEventPayload): Promise<void> {
    const JoinEventData: JoinEventData = {
      userId: payload.userId,
      eventId,
    };
    const user = await this.eventRepository.getUserById(payload.userId);
    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    const participantsNumber =
      await this.eventRepository.getNumberOfPeople(eventId);
    if (event.maxPeople <= participantsNumber) {
      throw new ConflictException('인원이 가득 찼습니다.');
    }
    const isUserJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      eventId,
      payload.userId,
    );
    if (isUserJoinedEvent) {
      throw new ConflictException('이미 참가한 모임입니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException('모임 시작 시간이 지났습니다.');
    }
    await this.eventRepository.joinEvent(JoinEventData);
  }

  async outEvent(eventId: number, payload: OutEventPayload): Promise<void> {
    const OutEventData: OutEventData = {
      userId: payload.userId,
      eventId,
    };
    const user = await this.eventRepository.getUserById(payload.userId);
    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    if (event.hostId === payload.userId) {
      throw new ConflictException('모임 주최자는 모임을 나갈 수 없습니다.');
    }
    const isUserJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      eventId,
      payload.userId,
    );
    if (!isUserJoinedEvent) {
      throw new ConflictException('참가하지 않은 모임입니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException('모임 시작 시간이 지났습니다.');
    }
    await this.eventRepository.outEvent(OutEventData);
  }

  async patchUpdateEvent(
    eventId: number,
    payload: PatchUpdateEventPaylaod,
  ): Promise<EventDto> {
    if (payload.title === null) {
      throw new BadRequestException('title은 null이 될 수 없습니다.');
    }
    if(payload.description === null) {
      throw new BadRequestException('description은 null이 될 수 없습니다.');
    }
    if(payload.categoryId === null) {
      throw new BadRequestException('categoryId은 null이 될 수 없습니다.');
    }
    else if (payload.categoryId !== undefined) {
      const category = await this.eventRepository.getCategoryById(payload.categoryId);
      if (!category) {
        throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
      }
    }
    if(payload.cityId === null) {
      throw new BadRequestException('cityId은 null이 될 수 없습니다.');
    }
    else if (payload.cityId !== undefined) {
      const city = await this.eventRepository.getCityById(payload.cityId);
      if (!city) {
        throw new NotFoundException('해당 도시를 찾을 수 없습니다.');
      }
    }
    if(payload.startTime === null) {
      throw new BadRequestException('startTime은 null이 될 수 없습니다.');
    }
    if(payload.endTime === null) {
      throw new BadRequestException('endTime은 null이 될 수 없습니다.');
    }
    if(payload.maxPeople === null) {
      throw new BadRequestException('maxPeople은 null이 될 수 없습니다.');
    }
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    
    if (payload.startTime && payload.endTime) {
      if (payload.endTime < payload.startTime) {
        throw new ConflictException(
          '모임 시작 시간이 종료 시간보다 늦을 수 없습니다.',
        );
      }
    }
    if (payload.startTime) {
      if (new Date() > payload.startTime) {
        throw new ConflictException(
          '모임 시작 시간이 현재 시간보다 늦어야 합니다.',
        );
      }
    }
    const updateData : UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const updatedEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );
    return EventDto.from(updatedEvent);
  }

  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException('모임 시작 시간이 지났습니다.');
    }
    await this.eventRepository.deleteEvent(eventId);
  }
}