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
import { ApplicantListDto } from './dto/applicantlist.dto';

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

    const isUserClubMember = await this.clubRepository.isUserClubMember(
      clubId,
      user.id,
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
    return ClubEventDto.from(event, clubId);
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
}
