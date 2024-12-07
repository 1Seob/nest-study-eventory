import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateEventData } from './type/create-event-data.type';
import { EventData } from './type/event-data.type';
import { EventQuery } from './query/event.query';
import { JoinEventData } from './type/join-event-data.type';
import { User, Category, City, Club, ClubJoinStatus } from '@prisma/client';
import { OutEventData } from './type/out-event-data.type';
import { UpdateEventData } from './type/update-event-data.type';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: CreateEventData): Promise<EventData> {
    return await this.prisma.event.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxPeople: data.maxPeople,
        eventJoin: {
          create: {
            userId: data.hostId,
          },
        },
        eventCity: {
          createMany: {
            data: data.cityIds.map((cityId) => ({
              cityId: cityId,
            })),
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        startTime: true,
        endTime: true,
        maxPeople: true,
        eventJoin: {
          select: {
            id: true,
            userId: true,
          },
        },
        eventCity: {
          select: {
            id: true,
            cityId: true,
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

  async isCitiesIdValid(citiesId: number[]): Promise<boolean> {
    const cities = await this.prisma.city.findMany({
      where: {
        id: {
          in: citiesId,
        },
      },
      select: {
        id: true,
      },
    });
    return cities.length === citiesId.length;
  }

  async getEventById(eventId: number): Promise<EventData | null> {
    return await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        eventCity: {
          select: {
            id: true,
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
        clubId: true,
        isArchived: true,
      },
    });
  }

  async getEvents(query: EventQuery, userId: number): Promise<EventData[]> {
    return await this.prisma.event.findMany({
      where: {
        AND: [
          {
            host: { deletedAt: null, id: query.hostId },
            categoryId: query.categoryId,
            eventCity: {
              some: { cityId: { in: query.cityIds } },
            },
          },
          {
            OR: [
              // 일반적인 이벤트 (아카이브되지 않은 경우)
              { isArchived: false, clubId: null },
              // 아카이브된 이벤트 (참여자인 경우만)
              {
                isArchived: true,
                eventJoin: { some: { userId } },
              },
              // 클럽 이벤트 (클럽 멤버인 경우만)
              {
                clubId: { not: null },
                club: {
                  clubJoin: {
                    some: {
                      userId,
                      status: ClubJoinStatus.MEMBER,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        eventCity: {
          select: {
            id: true,
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
        clubId: true,
        isArchived: true,
      },
    });
  }

  async getEventsJoinedByUser(userId: number): Promise<EventData[]> {
    return await this.prisma.event.findMany({
      where: {
        eventJoin: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        categoryId: true,
        eventCity: {
          select: {
            id: true,
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
        clubId: true,
        isArchived: true,
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
        },
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
        },
      },
    });
  }

  async updateEvent(
    eventId: number,
    data: UpdateEventData,
  ): Promise<EventData> {
    const cityIds = data.cityIds;
    return await this.prisma.$transaction(async (prisma) => {
      if (cityIds) {
        await prisma.eventCity.deleteMany({
          where: {
            eventId: eventId,
          },
        });

        await prisma.eventCity.createMany({
          data: cityIds.map((cityId) => ({
            eventId: eventId,
            cityId: cityId,
          })),
        });
      }

      return prisma.event.update({
        where: { id: eventId },
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
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
          eventCity: {
            select: {
              id: true,
              cityId: true,
            },
          },
          startTime: true,
          endTime: true,
          maxPeople: true,
        },
      });
    });
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.eventJoin.deleteMany({
        where: {
          eventId: eventId,
        },
      }),
      this.prisma.eventCity.deleteMany({
        where: {
          eventId: eventId,
        },
      }),
      this.prisma.event.delete({
        where: {
          id: eventId,
        },
      }),
    ]);
  }
}
