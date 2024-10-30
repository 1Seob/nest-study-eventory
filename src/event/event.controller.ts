import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventDto } from './dto/event.dto';
import { CreateEventPayload } from './payload/create-event.payload';

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
}
