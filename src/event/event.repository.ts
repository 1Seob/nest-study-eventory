import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateEventData } from './type/create-event-data.type';
import { EventData } from './type/event-data.type';
import { EventQuery } from './query/event.query';
import { JoinEventData } from './type/join-event-data.type';
import { User, Category, City } from '@prisma/client';
import { OutEventData } from './type/out-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: CreateEventData): Promise<EventData> {
    return this.prisma.event.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cityId: data.cityId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
        eventJoin: {
          create: {
            userId: data.hostId,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
        eventJoin: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async getUserById(hostId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: hostId,
        deletedAt: null,
      },
    });
  }

  async getCategoryById(categoryId: number): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
  }

  async getCityById(cityId: number): Promise<City | null> {
    return this.prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });
  }

  async getEventById(eventId: number): Promise<EventData | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async getEvents(query: EventQuery): Promise<EventData[]> {
    return this.prisma.event.findMany({
      where: {
        host: {
          deletedAt: null,
          id: query.hostId,
        },
        categoryId: query.categoryId,
        cityId: query.cityId,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async getNumberOfPeople(eventId: number): Promise<number> {
    return this.prisma.eventJoin.count({
      where: {
        eventId: eventId,
      },
    });
  }

  async joinEvent(data: JoinEventData): Promise<void> {
    await this.prisma.eventJoin.create({
      data: {
        eventId: data.eventId,
        userId: data.userId,
      },
      select: {
        eventId: true,
        userId: true,
      },
    });
  }

  async isUserJoinedEvent(eventId: number, userId: number): Promise<boolean> {
    const event = await this.prisma.eventJoin.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId,
        },
        user: {
          deletedAt: null,
        }
      },
    });

    return !!event;
  }

  async outEvent(data: OutEventData): Promise<void> {
    await this.prisma.eventJoin.delete({
      where: {
        eventId_userId: {
          eventId: data.eventId,
          userId: data.userId,
        },
        user: {
          deletedAt: null,
        }
      },
    });
  }

  async updateEvent(eventId: number, data: UpdateEventData): Promise<EventData> {
    return this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        cityId: data.cityId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        cityId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.prisma.eventJoin.deleteMany({
      where: {
        eventId: eventId,
      },
    });
    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });
  }
}