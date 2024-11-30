import { Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { ClubDto } from './dto/club.dto';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { CreateClubData } from './type/create-club-data.type';
import { CreateEventPayload } from '../event/payload/create-event.payload';
import { ClubEventDto } from './dto/club-event.dto';
import { CreateClubEventData } from './type/create-club-event-data.type';
import { EventRepository } from 'src/event/event.repository';

@Injectable()
export class ClubService {
  constructor(
    private readonly clubRepository: ClubRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async createClub(
    paylaod: CreateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const clubData: CreateClubData = {
      hostId: user.id,
      title: paylaod.title,
      description: paylaod.description,
      maxPeople: paylaod.maxPeople,
    };
    const club = await this.clubRepository.createClub(clubData);
    return ClubDto.from(club);
  }

  async createClubEvent(
    clubId: number,
    payload: CreateEventPayload,
    user: UserBaseInfo,
  ): Promise<ClubEventDto> {
    const createData: CreateClubEventData = {
      hostId: user.id,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
      clubId,
    };

    const isUserJoinedClub = await this.clubRepository.isUserJoinedClub(
      user.id,
      clubId,
    );
    if (!isUserJoinedClub) {
      throw new NotFoundException(
        '클럽에 가입한 사용자만 해당 클럽의 전용 모임을 생성할 수 있습니다.',
      );
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

    const event = await this.clubRepository.createClubEvent(createData);
    return ClubEventDto.from(event, clubId);
  }
}
