import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { ClubJoinStatus } from '@prisma/client';
import { CreateClubEventData } from './type/create-club-event-data.type';
import { EventData } from '../event/type/event-data.type';
import { ApplicantData } from './type/applicant-data.type';

@Injectable()
export class ClubRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(data: CreateClubData): Promise<ClubData> {
    return await this.prisma.club.create({
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
    return await this.prisma.club.findUnique({
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
  }

  async isUserClubMember(userId: number, clubId: number): Promise<boolean> {
    const clubJoin = await this.prisma.clubJoin.findFirst({
      where: {
        userId,
        clubId,
        status: ClubJoinStatus.MEMBER,
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

  async getClubMemberNumber(clubId: number): Promise<number> {
    return await this.prisma.clubJoin.count({
      where: {
        clubId,
        status: ClubJoinStatus.MEMBER,
      },
    });
  }

  async applyClub(userId: number, clubId: number): Promise<void> {
    await this.prisma.clubJoin.create({
      data: {
        userId,
        clubId,
        status: ClubJoinStatus.APPLICANT,
      },
    });
  }

  async getApplicants(clubId: number): Promise<ApplicantData[]> {
    return await this.prisma.clubJoin.findMany({
      where: {
        clubId,
        status: ClubJoinStatus.APPLICANT,
      },
      select: {
        userId: true,
        status: true,
      },
    });
  }
}
