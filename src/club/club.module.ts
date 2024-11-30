import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { ClubRepository } from './club.repository';
import { EventRepository } from '../event/event.repository';

@Module({
  controllers: [ClubController],
  providers: [ClubService, ClubRepository, EventRepository],
})
export class ClubModule {}
