import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { ClubDto } from './dto/club.dto';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { CreateClubData } from './type/create-club-data.type';
import { CreateEventPayload } from '../event/payload/create-event.payload';
import { CreateClubEventData } from './type/create-club-event-data.type';
import { EventRepository } from 'src/event/event.repository';
import { ApplicantListDto } from './dto/applicantlist.dto';
import { PatchUpdateEventPaylaod } from '../event/payload/patch-update-event.payload';
import { UpdateEventData } from 'src/event/type/update-event-data.type';
import { EventDto } from '../event/dto/event.dto';

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
  ): Promise<EventDto> {
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

    const isUserClubMember = await this.clubRepository.isUserClubMember(
      user.id,
      clubId,
    );
    if (!isUserClubMember) {
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
    return EventDto.fromWithClub(event, clubId);
  }

  async applyClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다');
    }
    const isUserClubMember = await this.clubRepository.isUserClubMember(
      user.id,
      clubId,
    );
    if (isUserClubMember) {
      throw new ConflictException('이미 해당 클럽에 가입되어 있습니다.');
    }
    const memberNumber = await this.clubRepository.getClubMemberNumber(clubId);
    if (memberNumber >= club.maxPeople) {
      throw new ConflictException('클럽의 정원이 가득 찼습니다.');
    }
    await this.clubRepository.applyClub(user.id, clubId);
  }

  async getApplicants(
    clubId: number,
    user: UserBaseInfo,
  ): Promise<ApplicantListDto> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    if (club.hostId !== user.id) {
      throw new ConflictException('클럽장만 가입 신청자를 조회할 수 있습니다.');
    }
    const applicants = await this.clubRepository.getApplicants(clubId);
    return ApplicantListDto.from(applicants);
  }

  async approveApplicant(
    clubId: number,
    userId: number,
    user: UserBaseInfo,
  ): Promise<void> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    const applicant = await this.clubRepository.getUserById(userId);
    if (!applicant) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    if (club.hostId !== user.id) {
      throw new ConflictException('클럽장만 가입 신청자를 승인할 수 있습니다.');
    }
    const isClubApplicant = await this.clubRepository.isClubApplicant(
      userId,
      clubId,
    );
    if (!isClubApplicant) {
      throw new NotFoundException('클럽 가입 신청자가 아닙니다.');
    }
    const memberNumber = await this.clubRepository.getClubMemberNumber(clubId);
    if (memberNumber >= club.maxPeople) {
      throw new ConflictException('클럽의 정원이 가득 찼습니다.');
    }
    await this.clubRepository.approveApplicant(clubId, userId);
  }

  async rejectApplicant(
    clubId: number,
    userId: number,
    user: UserBaseInfo,
  ): Promise<void> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    const applicant = await this.clubRepository.getUserById(userId);
    if (!applicant) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    if (club.hostId !== user.id) {
      throw new ConflictException('클럽장만 가입 신청자를 거절할 수 있습니다.');
    }
    const isClubApplicant = await this.clubRepository.isClubApplicant(
      userId,
      clubId,
    );
    if (!isClubApplicant) {
      throw new NotFoundException('클럽 가입 신청자가 아닙니다.');
    }
    await this.clubRepository.rejectApplicant(clubId, userId);
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
    const club = await this.clubRepository.getClubByEventId(eventId);
    if (!club) {
      throw new NotFoundException('해당 모임은 클럽 전용 모임이 아닙니다.');
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
    return EventDto.fromWithClub(updatedEvent, club.id);
  }

  async deleteClubEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.getClubByEventId(eventId);
    if (!club) {
      throw new NotFoundException('해당 모임은 클럽 전용 모임이 아닙니다.');
    }
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
