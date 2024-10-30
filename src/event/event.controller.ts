import { Body, Controller, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
}
