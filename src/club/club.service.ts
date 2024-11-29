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
import { ReviewRepository } from 'src/review/review.repository';
import { CreateReviewPayload } from 'src/review/payload/create-review.payload';
import { ClubReviewDto } from './dto/club-review.dto';
import { CreateReviewData } from 'src/review/type/create-review-data.type';

@Injectable()
export class ClubService {
  constructor(
    private readonly clubRepository: ClubRepository,
    private readonly eventRepository: EventRepository,
    private readonly reviewRepository: ReviewRepository,
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
      clubId,
    };
  }

  async createClubReview(
    clubId: number,
    payload: CreateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ClubReviewDto> {
    const event = await this.reviewRepository.getEventById(payload.eventId);
    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }
    const isClubEvent = await this.clubRepository.isClubEvent(
      payload.eventId,
      clubId,
    );
    if (!isClubEvent) {
      throw new NotFoundException('해당 모임은 해당 클럽의 모임이 아닙니다.');
    }
    const isReviewExist = await this.reviewRepository.isReviewExist(
      user.id,
      payload.eventId,
    );
    if (isReviewExist) {
      throw new ConflictException('당신의 리뷰가 이미 존재합니다.');
    }

    const isUserJoinedEvent = await this.reviewRepository.isUserJoinedEvent(
      user.id,
      payload.eventId,
    );
    if (!isUserJoinedEvent) {
      throw new ConflictException('참가하지 않은 모임입니다.');
    }

    if (event.endTime > new Date()) {
      throw new ConflictException(
        '모임이 종료되지 않았습니다. 아직 리뷰를 작성할 수 없습니다.',
      );
    }

    if (event.hostId === user.id) {
      throw new ConflictException(
        '자신이 주최한 모임에는 리뷰를 작성 할 수 없습니다.',
      );
    }

    const createData: CreateReviewData = {
      userId: user.id,
      eventId: payload.eventId,
      score: payload.score,
      title: payload.title,
      description: payload.description,
    };

    const review = await this.reviewRepository.createReview(createData);

    return {
      id: review.id,
      eventId: review.eventId,
      userId: review.userId,
      score: review.score,
      title: review.title,
      description: review.description,
      clubId,
    };
  }
}
