import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { ClubRepository } from './club.repository';
import { EventRepository } from '../event/event.repository';
import { ReviewRepository } from 'src/review/review.repository';

@Module({
  controllers: [ClubController],
  providers: [ClubService, ClubRepository, EventRepository, ReviewRepository],
})
export class ClubModule {}
