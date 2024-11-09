import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { EventDto, EventListDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';
import { JoinEventPayload } from './payload/join-event.payload';
import { OutEventPayload } from './payload/out-event.payload';
import { EventQuery } from './query/event.query';

@Controller('events')
@ApiTags('Event API')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '새로운 모임을 추가합니다' })
  @ApiCreatedResponse({ type: EventDto })
  async createEvent(
    @Body() createEventPayload: CreateEventPayload,
  ): Promise<EventDto> {
    return this.eventService.createEvent(createEventPayload);
  }

  @Get(':eventId')
  @ApiOperation({ summary: '특정 모임을 조회합니다' })
  @ApiOkResponse({ type: EventDto })
  async getEventbyId(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventDto> {
    return this.eventService.getEventById(eventId);
  }

  @Get()
  @ApiOperation({ summary: '여러 모임을 조회합니다' })
  @ApiOkResponse({ type: EventListDto })
  async getEvents(@Query() query: EventQuery): Promise<EventListDto> {
    return this.eventService.getEvents(query);
  }

  @Post(':eventId/join')
  @ApiOperation({ summary: '특정 모임에 참가합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async joinEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() joinEventPayload: JoinEventPayload,
  ): Promise<void> {
    return this.eventService.joinEvent(eventId, joinEventPayload);
  }

  @Post(':eventId/out')
  @ApiOperation({ summary: '특정 모임에서 나갑니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async outEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() outEventPayload: OutEventPayload,
  ): Promise<void> {
    return this.eventService.outEvent(eventId, outEventPayload);
  }
}
