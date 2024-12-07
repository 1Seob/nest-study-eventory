import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { PatchUpdateEventPaylaod } from './payload/patch-update-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventQuery } from './query/event.query';
import { CreateEventData } from './type/create-event-data.type';
import { JoinEventData } from './type/join-event-data.type';
import { OutEventData } from './type/out-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { ClubRepository } from 'src/club/club.repository';
import { EventData } from './type/event-data.type';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly clubRepository: ClubRepository,
  ) {}

  async createEvent(
    payload: CreateEventPayload,
    user: UserBaseInfo,
  ): Promise<EventDto> {
    const createData: CreateEventData = {
      hostId: user.id,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const host = await this.eventRepository.getUserById(user.id);
    if (!host) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }

    const category = await this.eventRepository.getCategoryById(
      payload.categoryId,
    );
    if (!category) {
      throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
    }
    const isCitiesIdValid = await this.eventRepository.isCitiesIdValid(
      payload.cityIds,
    );
    if (!isCitiesIdValid) {
      throw new NotFoundException('존재하지 않는 도시 ID가 있습니다.');
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

  async getEvents(
    query: EventQuery,
    user: UserBaseInfo,
  ): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);
    const clubIdsJoinedByUser =
      await this.clubRepository.getClubIdsJoinedByUser(user.id);
    const achivedEventIdsJoinedByUser =
      await this.eventRepository.getAchivedEventIdsJoinedByUser(user.id);
    let eventList: EventData[] = [];
    for (const event of events) {
      eventList.push(event);
      if (event.clubId && !clubIdsJoinedByUser.includes(event.clubId)) {
        eventList.pop();
        continue;
      }
      if (
        event.isArchived == true &&
        !achivedEventIdsJoinedByUser.includes(event.id)
      ) {
        eventList.pop();
        continue;
      }
    }
    return EventListDto.from(eventList);
  }

  async getEventById(eventId: number, user: UserBaseInfo): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    const club = await this.clubRepository.getClubByEventId(eventId);
    if (club) {
      const isUserClubMember = await this.clubRepository.isUserClubMember(
        user.id,
        club.id,
      );
      if (!isUserClubMember) {
        throw new ConflictException(
          '해당 모임은 클럽 전용 모임입니다. 클럽에 가입하지 않은 사용자는 클럽 전용 모임을 조회할 수 없습니다.',
        );
      }
    }
    if (event.isArchived === true) {
      const isUserJoinedEvent = await this.eventRepository.isUserJoinedEvent(
        eventId,
        user.id,
      );
      if (!isUserJoinedEvent) {
        throw new ConflictException(
          '해당 모임은 참가자만 조회할 수 있는 모임입니다.',
        );
      }
    }
    return EventDto.from(event);
  }

  async getMyEvents(user: UserBaseInfo): Promise<EventListDto> {
    const events = await this.eventRepository.getEventsJoinedByUser(user.id);
    return EventListDto.from(events);
  }

  async joinEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const JoinEventData: JoinEventData = {
      userId: user.id,
      eventId,
    };
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    const club = await this.clubRepository.getClubByEventId(eventId);
    if (club) {
      const isUserClubMember = await this.clubRepository.isUserClubMember(
        user.id,
        club.id,
      );
      if (!isUserClubMember) {
        throw new ConflictException(
          '해당 모임은 클럽 전용 모임입니다. 클럽에 가입하지 않은 사용자는 클럽 전용 모임에 참가할 수 없습니다.',
        );
      }
    }
    const participantsNumber =
      await this.eventRepository.getNumberOfPeople(eventId);
    if (event.maxPeople <= participantsNumber) {
      throw new ConflictException('인원이 가득 찼습니다.');
    }
    const isUserJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      eventId,
      user.id,
    );
    if (isUserJoinedEvent) {
      throw new ConflictException('이미 참가한 모임입니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException('모임 시작 시간이 지났습니다.');
    }
    await this.eventRepository.joinEvent(JoinEventData);
  }

  async outEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const OutEventData: OutEventData = {
      userId: user.id,
      eventId,
    };
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    if (event.hostId === user.id) {
      throw new ConflictException('모임 주최자는 모임을 나갈 수 없습니다.');
    }
    const isUserJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      eventId,
      user.id,
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
    user: UserBaseInfo,
  ): Promise<EventDto> {
    if (payload.title === null) {
      throw new BadRequestException('title은 null이 될 수 없습니다.');
    }
    if (payload.description === null) {
      throw new BadRequestException('description은 null이 될 수 없습니다.');
    }
    if (payload.categoryId === null) {
      throw new BadRequestException('categoryId은 null이 될 수 없습니다.');
    }
    if (payload.categoryId) {
      const category = await this.eventRepository.getCategoryById(
        payload.categoryId,
      );
      if (!category) {
        throw new NotFoundException('해당 카테고리를 찾을 수 없습니다.');
      }
    }

    if (payload.cityIds === null) {
      throw new BadRequestException('cityIds은 null이 될 수 없습니다.');
    }
    if (payload.cityIds) {
      const isCitiesIdValid = await this.eventRepository.isCitiesIdValid(
        payload.cityIds,
      );
      if (!isCitiesIdValid) {
        throw new NotFoundException('존재하지 않는 도시 ID가 있습니다.');
      }
    }

    if (payload.startTime === null) {
      throw new BadRequestException('startTime은 null이 될 수 없습니다.');
    }
    if (payload.endTime === null) {
      throw new BadRequestException('endTime은 null이 될 수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new BadRequestException('maxPeople은 null이 될 수 없습니다.');
    }
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException(
        '이미 시작된 모임의 정보를 변경할 수 없습니다.',
      );
    }
    if (event.hostId !== user.id) {
      throw new ConflictException(
        '모임 주최자만 모임 정보를 변경할 수 있습니다.',
      );
    }
    const updateData: UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };
    if (updateData.startTime && !updateData.endTime) {
      if (updateData.startTime > event.endTime) {
        throw new ConflictException(
          '변경될 모임 시작 시간이 기존 종료 시간보다 늦을 수 없습니다.',
        );
      }
      if (new Date() > updateData.startTime) {
        throw new ConflictException(
          '변경될 모임 시작 시간이 현재 시간보다 늦어야 합니다.',
        );
      }
    }
    if (updateData.endTime && !updateData.startTime) {
      if (updateData.endTime < event.startTime) {
        throw new ConflictException(
          '변경될 모임 종료 시간이 기존 시작 시간보다 빠를 수 없습니다.',
        );
      }
      if (new Date() > updateData.endTime) {
        throw new ConflictException(
          '변경될 모임 종료 시간이 현재 시간보다 늦어야 합니다.',
        );
      }
    }
    if (updateData.startTime && updateData.endTime) {
      if (updateData.endTime < updateData.startTime) {
        throw new ConflictException(
          '변경될 모임 시작 시간이 변경될 종료 시간보다 늦을 수 없습니다.',
        );
      }
      if (updateData.startTime < new Date()) {
        throw new ConflictException(
          '변경될 모임 시작 시간이 현재 시간보다 늦어야 합니다.',
        );
      }
    }

    const updatedEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );
    return EventDto.from(updatedEvent);
  }

  async deleteEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('해당 모임을 찾을 수 없습니다.');
    }
    if (new Date() > event.startTime) {
      throw new ConflictException('모임 시작 시간이 지났습니다.');
    }
    if (event.hostId !== user.id) {
      throw new ConflictException('모임 주최자만 모임을 삭제할 수 있습니다.');
    }
    await this.eventRepository.deleteEvent(eventId);
  }
}
