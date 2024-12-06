import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { CreateClubPayload } from './payload/create-club.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { CreateEventPayload } from '../event/payload/create-event.payload';
import { ApplicantListDto } from './dto/applicantlist.dto';
import { EventDto } from '../event/dto/event.dto';
import { ClubQuery } from './query/club.query';
import { PatchUpdateClubPayload } from './payload/patch-update-club.payload';

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
    @Param('clubId', ParseIntPipe) clubId: number,
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
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.applyClub(clubId, user);
  }

  @Post(':clubId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽에서 탈퇴합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async leaveClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.leaveClub(clubId, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내가 가입한 클럽 목록을 조회합니다' })
  @ApiOkResponse({ type: ClubListDto })
  async getMyClubs(@CurrentUser() user: UserBaseInfo): Promise<ClubListDto> {
    return this.clubService.getMyClubs(user);
  }

  @Get(':clubId')
  @ApiOperation({ summary: '특정 클럽을 조회합니다' })
  @ApiOkResponse({ type: ClubDto })
  async getClubById(
    @Param('clubId', ParseIntPipe) clubId: number,
  ): Promise<ClubDto> {
    return this.clubService.getClubById(clubId);
  }

  @Get()
  @ApiOperation({ summary: '여러 클럽을 조회합니다' })
  @ApiOkResponse({ type: ClubListDto })
  async getClubs(@Query() query: ClubQuery): Promise<ClubListDto> {
    return this.clubService.getClubs(query);
  }

  @Patch(':clubId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽 정보를 수정합니다' })
  @ApiOkResponse({ type: ClubDto })
  async patchUpdateClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Body() payload: PatchUpdateClubPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubDto> {
    return this.clubService.patchUpdateClub(clubId, payload, user);
  }

  @Get(':clubId/applicants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(클럽장) 클럽 가입 신청자들을 조회합니다' })
  @ApiOkResponse({ type: ApplicantListDto })
  async getApplicants(
    @Param('clubId', ParseIntPipe) clubId: number,
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
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
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
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.rejectApplicant(clubId, userId, user);
  }

  @Post(':clubId/delegate/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(클럽장) 클럽장을 위임합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async delegateHost(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    await this.clubService.delegateHost(clubId, userId, user);
  }
}
