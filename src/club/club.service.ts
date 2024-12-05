import { Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { CreateClubData } from './type/create-club-data.type';
import { CreateEventPayload } from '../event/payload/create-event.payload';
import { CreateClubEventData } from './type/create-club-event-data.type';
import { EventRepository } from 'src/event/event.repository';
import { ApplicantListDto } from './dto/applicantlist.dto';
import { EventDto } from '../event/dto/event.dto';
import { ClubQuery } from './query/club.query';
import { PatchUpdateClubPayload } from './payload/patch-update-club.payload';
import { UpdateClubData } from './type/update-club-data.type';

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
    return EventDto.from(event);
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

  async leaveClub(clubId: number, user: UserBaseInfo): Promise<void> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    const isUserClubMember = await this.clubRepository.isUserClubMember(
      user.id,
      clubId,
    );
    if (!isUserClubMember) {
      throw new ConflictException('해당 클럽에 가입되어 있지 않습니다.');
    }
    if (user.id === club.hostId) {
      throw new ConflictException('클럽장은 클럽에서 나갈 수 없습니다');
    }
    const events = await this.clubRepository.getClubEventsJoinByUser(
      user.id,
      clubId,
    );
    let deleteEventsIds: number[] = [];
    let outEventsIds: number[] = [];
    for (const event of events) {
      if (event.startTime < new Date() && new Date() < event.endTime) {
        throw new ConflictException(
          '이미 진행 중인 클럽 전용 모임이 있습니다.',
        );
      }
      if (new Date() > event.startTime) {
        continue;
      }
      if (user.id === event.hostId) {
        deleteEventsIds.push(event.id);
      }
      outEventsIds.push(event.id);
    }
    await this.clubRepository.leaveClub(
      clubId,
      user.id,
      deleteEventsIds,
      outEventsIds,
    );
  }

  async delegateHost(clubId: number, userId: number, user: UserBaseInfo) {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    if (club.hostId !== user.id) {
      throw new ConflictException('클럽장만 클럽장을 위임할 수 있습니다.');
    }
    const newHost = await this.clubRepository.getUserById(userId);
    if (!newHost) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    const isUserClubMember = await this.clubRepository.isUserClubMember(
      userId,
      clubId,
    );
    if (!isUserClubMember) {
      throw new ConflictException(
        '클럽 멤버에게만 클럽장을 위임할 수 있습니다.',
      );
    }
    await this.clubRepository.delegateHost(clubId, userId);
  }

  async getMyClubs(user: UserBaseInfo): Promise<ClubListDto> {
    const clubs = await this.clubRepository.getMyClubs(user.id);
    return ClubListDto.from(clubs);
  }

  async getClubById(clubId: number): Promise<ClubDto> {
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    return ClubDto.from(club);
  }

  async getClubs(query: ClubQuery): Promise<ClubListDto> {
    const clubs = await this.clubRepository.getClubs(query);
    return ClubListDto.from(clubs);
  }

  async patchUpdateClub(
    clubId: number,
    payload: PatchUpdateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    if (payload.title === null) {
      throw new ConflictException('클럽 이름은 null이 될 수 없습니다.');
    }
    if (payload.description === null) {
      throw new ConflictException('클럽 설명은 null이 될 수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new ConflictException('최대 인원 수는 null이 될 수 없습니다.');
    }
    const club = await this.clubRepository.getClubById(clubId);
    if (!club) {
      throw new NotFoundException('존재하지 않는 클럽입니다.');
    }
    if (club.hostId !== user.id) {
      throw new ConflictException('클럽장만 클럽 정보를 수정할 수 있습니다.');
    }
    const memberNumber = await this.clubRepository.getClubMemberNumber(clubId);
    if (payload.maxPeople && memberNumber > payload.maxPeople) {
      throw new ConflictException(
        '클럽의 정원이 현재 인원 수보다 작을 수 없습니다.',
      );
    }
    const updateData: UpdateClubData = {
      title: payload.title,
      description: payload.description,
      maxPeople: payload.maxPeople,
    };
    const updatedClub = await this.clubRepository.patchUpdateClub(
      clubId,
      updateData,
    );
    return ClubDto.from(updatedClub);
  }
}
