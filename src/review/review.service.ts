import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewPayload } from './payload/create-review.payload';
import { ReviewDto, ReviewListDto } from './dto/review.dto';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewQuery } from './query/review.query';
import { UpdateReviewData } from './type/update-review-data.type';
import { PutUpdateReviewPayload } from './payload/put-update-review.payload';
import { PatchUpdateReviewPayload } from './payload/patch-update-review.payload';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { EventRepository } from 'src/event/event.repository';
import { ClubRepository } from 'src/club/club.repository';
import { ReviewData } from './type/review-data.type';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly eventRepository: EventRepository,
    private readonly clubRepository: ClubRepository,
  ) {}

  async createReview(
    payload: CreateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const isReviewExist = await this.reviewRepository.isReviewExist(
      user.id,
      payload.eventId,
    );
    if (isReviewExist) {
      throw new ConflictException('해당 유저의 리뷰가 이미 존재합니다.');
    }

    const isUserJoinedEvent = await this.reviewRepository.isUserJoinedEvent(
      user.id,
      payload.eventId,
    );
    if (!isUserJoinedEvent) {
      throw new ConflictException('해당 유저가 이벤트에 참가하지 않았습니다.');
    }

    const event = await this.reviewRepository.getEventById(payload.eventId);
    if (!event) {
      throw new NotFoundException('Event가 존재하지 않습니다.');
    }

    if (event.endTime > new Date()) {
      throw new ConflictException(
        'Event가 종료되지 않았습니다. 아직 리뷰를 작성할 수 없습니다.',
      );
    }

    if (event.hostId === user.id) {
      throw new ConflictException(
        '자신이 주최한 이벤트에는 리뷰를 작성 할 수 없습니다.',
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

    return ReviewDto.from(review);
  }

  async getReviewById(
    reviewId: number,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const review = await this.reviewRepository.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException('Review가 존재하지 않습니다.');
    }
    const event = await this.eventRepository.getEventById(review.eventId);
    if (event?.clubId) {
      const isUserClubMember = await this.clubRepository.isUserClubMember(
        user.id,
        event.clubId,
      );
      if (!isUserClubMember) {
        throw new ConflictException(
          '클럽 회원만 클럽 전용 모임의 리뷰를 볼 수 있습니다.',
        );
      }
    }
    if (event?.isArchived) {
      const isUserJoinedEvent = await this.reviewRepository.isUserJoinedEvent(
        user.id,
        review.eventId,
      );
      if (!isUserJoinedEvent) {
        throw new ConflictException('모임 참가자만 볼 수 있는 리뷰입니다');
      }
    }
    return ReviewDto.from(review);
  }

  async getReviews(
    query: ReviewQuery,
    user: UserBaseInfo,
  ): Promise<ReviewListDto> {
    const reviews = await this.reviewRepository.getReviews(query);
    const map = await this.eventRepository.getMapReviewToEventDetails(
      reviews.map((review) => review.id),
    );
    const clubIdsJoinedByUser =
      await this.clubRepository.getClubIdsJoinedByUser(user.id);
    const achivedEventIdsJoinedByUser =
      await this.eventRepository.getAchivedEventIdsJoinedByUser(user.id);
    let reviewList: ReviewData[] = [];
    for (const review of reviews) {
      reviewList.push(review);
      const eventId = map.get(review.id)?.eventId;
      const clubId = map.get(review.id)?.clubId;
      const isArchived = map.get(review.id)?.isArchived;
      if (clubId && !clubIdsJoinedByUser.includes(clubId)) {
        reviewList.pop();
        continue;
      }
      if (
        isArchived &&
        eventId &&
        !achivedEventIdsJoinedByUser.includes(eventId)
      ) {
        reviewList.pop();
        continue;
      }
    }
    return ReviewListDto.from(reviewList);
  }

  async putUpdateReview(
    reviewId: number,
    payload: PutUpdateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    await this.checkPermissionForModifyReview(reviewId, user.id);

    const updateData: UpdateReviewData = {
      score: payload.score,
      title: payload.title,
      description: payload.description ?? null,
    };

    const updatedReview = await this.reviewRepository.updateReview(
      reviewId,
      updateData,
    );

    return ReviewDto.from(updatedReview);
  }

  async patchUpdateReview(
    reviewId: number,
    payload: PatchUpdateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    if (payload.score === null) {
      throw new BadRequestException('score는 null이 될 수 없습니다.');
    }

    if (payload.title === null) {
      throw new BadRequestException('title은 null이 될 수 없습니다.');
    }

    await this.checkPermissionForModifyReview(reviewId, user.id);

    const updateData: UpdateReviewData = {
      score: payload.score,
      title: payload.title,
      description: payload.description,
    };

    const updatedReview = await this.reviewRepository.updateReview(
      reviewId,
      updateData,
    );

    return ReviewDto.from(updatedReview);
  }

  async deleteReview(reviewId: number, user: UserBaseInfo): Promise<void> {
    await this.checkPermissionForModifyReview(reviewId, user.id);

    await this.reviewRepository.deleteReview(reviewId);
  }

  private async checkPermissionForModifyReview(
    reviewId: number,
    userId: number,
  ): Promise<void> {
    const review = await this.reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new NotFoundException('Review가 존재하지 않습니다.');
    }

    if (review.userId !== userId) {
      throw new ConflictException('해당 리뷰를 삭제할 권한이 없습니다.');
    }
  }
}
