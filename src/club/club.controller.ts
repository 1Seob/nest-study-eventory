import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClubDto } from './dto/club.dto';
import { CreateClubPayload } from './payload/create-club.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ClubEventDto } from './dto/club-event.dto';
import { CreateEventPayload } from '../event/payload/create-event.payload';

@Controller('clubs')
@ApiTags('Club API')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새로운 클럽을 추가합니다' })
  @ApiCreatedResponse({ type: ClubDto })
  async createClub(
    @Body() createClubPayload: CreateClubPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubDto> {
    return this.clubService.createClub(createClubPayload, user);
  }

  @Post(':clubId/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새로운 클럽 모임을 추가합니다' })
  @ApiCreatedResponse({ type: ClubEventDto })
  async createClubEvent(
    @Param('clubId') clubId: number,
    @Body() createClubEventPayload: CreateEventPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubEventDto> {
    return this.clubService.createClubEvent(
      clubId,
      createClubEventPayload,
      user,
    );
  }
}
