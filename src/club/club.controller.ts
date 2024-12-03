import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClubDto } from './dto/club.dto';
import { CreateClubPayload } from './payload/create-club.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { CreateEventPayload } from '../event/payload/create-event.payload';
import { ApplicantListDto } from './dto/applicantlist.dto';
import { EventDto } from '../event/dto/event.dto';

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
  @ApiCreatedResponse({ type: EventDto })
  async createClubEvent(
    @Param('clubId') clubId: number,
    @Body() createClubEventPayload: CreateEventPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<EventDto> {
    return this.clubService.createClubEvent(
      clubId,
      createClubEventPayload,
      user,
    );
  }

  @Post(':clubId/application')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽에 가입 신청을 합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async applyClub(
    @Param('clubId') clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.applyClub(clubId, user);
  }

  @Get(':clubId/applicants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(클럽장) 클럽 가입 신청자들을 조회합니다' })
  @ApiCreatedResponse({ type: ApplicantListDto })
  async getApplicants(
    @Param('clubId') clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ApplicantListDto> {
    return this.clubService.getApplicants(clubId, user);
  }

  @Post(':clubId/applicants/:userId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(클럽장) 클럽 가입 신청자를 승인합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async acceptApplicant(
    @Param('clubId') clubId: number,
    @Param('userId') userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.approveApplicant(clubId, userId, user);
  }

  @Post(':clubId/applicants/:userId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(클럽장) 클럽 가입 신청자를 거절합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async rejectApplicant(
    @Param('clubId') clubId: number,
    @Param('userId') userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.rejectApplicant(clubId, userId, user);
  }
}
