import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';

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
            status: 'MEMBER',
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
            id: true,
            userId: true,
          },
        },
      },
    });
  }
}