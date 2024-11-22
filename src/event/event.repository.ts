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
    const newEvent = await this.prisma.$transaction(async (prisma) => {
      const createdEvent = await prisma.event.create({
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
        },
      });
      await prisma.eventCity.createMany({
        data: data.citiesId.map((cityId) => ({
          eventId: createdEvent.id,
          cityId: cityId,
        })),
      });

      return createdEvent;
    });
    const eventData: EventData = {
      id: newEvent.id,
      hostId: newEvent.hostId,
      title: newEvent.title,
      description: newEvent.description,
      categoryId: newEvent.categoryId,
      citiesId: data.citiesId,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      maxPeople: newEvent.maxPeople,
    };

    return eventData;
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

  async getVailidCitiesId(): Promise<number[]> {
    return this.prisma.city
      .findMany({
        select: {
          id: true,
        },
      })
      .then((cities) => cities.map((city) => city.id));
  }

  async getEventById(eventId: number): Promise<EventData | null> {
    const event = this.prisma.event.findUnique({
      where: {
        id: eventId,
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
      },
    });
    const newEvent = await event;
    if (!newEvent) {
      return null;
    } else {
      const eventData: EventData = {
        id: newEvent.id,
        hostId: newEvent.hostId,
        title: newEvent.title,
        description: newEvent.description,
        categoryId: newEvent.categoryId,
        citiesId: (
          await this.prisma.eventCity.findMany({
            where: {
              eventId: eventId,
            },
            select: {
              cityId: true,
            },
          })
        ).map((city) => city.cityId),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        maxPeople: newEvent.maxPeople,
      };
      return eventData;
    }
  }

  async getEvents(query: EventQuery): Promise<EventData[]> {
    const events = await this.prisma.event.findMany({
      where: {
        host: {
          deletedAt: null,
          id: query.hostId,
        },
        categoryId: query.categoryId,
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
      },
    });

    const eventCities = await Promise.all(
      events.map(async (event) => {
        const cities = await this.prisma.eventCity.findMany({
          where: {
            eventId: event.id,
          },
          select: {
            cityId: true,
          },
        });
        return {
          ...event,
          citiesId: cities.map((city) => city.cityId),
        };
      }),
    );

    return eventCities.map((event) => ({
      id: event.id,
      hostId: event.hostId,
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      citiesId: event.citiesId,
      startTime: event.startTime,
      endTime: event.endTime,
      maxPeople: event.maxPeople,
    }));
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
    const citiesId = data.citiesId || [];
    if (citiesId) {
      await this.prisma.$transaction([
        this.prisma.eventCity.deleteMany({
          where: {
            eventId: eventId,
          },
        }),
        this.prisma.eventCity.createMany({
          data: citiesId.map((cityId) => ({
            eventId: eventId,
            cityId: cityId,
          })),
        }),
      ]);
    }
    const updateEvent = this.prisma.event.update({
      where: {
        id: eventId,
      },
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
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
    const eventData: EventData = {
      id: (await updateEvent).id,
      hostId: (await updateEvent).hostId,
      title: (await updateEvent).title,
      description: (await updateEvent).description,
      categoryId: (await updateEvent).categoryId,
      citiesId,
      startTime: (await updateEvent).startTime,
      endTime: (await updateEvent).endTime,
      maxPeople: (await updateEvent).maxPeople,
    };
    return eventData;
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
