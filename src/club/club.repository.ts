import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { ClubJoinStatus } from '@prisma/client';
import { CreateClubEventData } from './type/create-club-event-data.type';
import { EventData } from '../event/type/event-data.type';

@Injectable()
export class ClubRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(data: CreateClubData): Promise<ClubData> {
    const club = await this.prisma.club.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        maxPeople: data.maxPeople,
        clubJoin: {
          create: {
            userId: data.hostId,
            status: ClubJoinStatus.MEMBER,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });
    return {
      id: club.id,
      hostId: club.hostId,
      title: club.title,
      description: club.description,
      maxPeople: club.maxPeople,
      members: club.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    };
  }

  async createClubEvent(data: CreateClubEventData): Promise<EventData> {
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
        clubId: data.clubId,
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

  async getClubById(id: number): Promise<ClubData | null> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        maxPeople: true,
        clubJoin: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    });
    if (!club) {
      return null;
    }
    return {
      id: club.id,
      hostId: club.hostId,
      title: club.title,
      description: club.description,
      maxPeople: club.maxPeople,
      members: club.clubJoin.map((join) => ({
        userId: join.userId,
        status: join.status,
      })),
    };
  }

  async isUserJoinedClub(userId: number, clubId: number): Promise<boolean> {
    const clubJoin = await this.prisma.clubJoin.findFirst({
      where: {
        userId,
        clubId,
      },
    });
    return !!clubJoin;
  }

  async isClubEvent(eventId: number, clubId: number): Promise<boolean> {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        clubId: clubId,
      },
    });
    return !!event;
  }
}
