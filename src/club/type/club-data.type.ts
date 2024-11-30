import { ClubJoinStatus } from '@prisma/client';

export type ClubData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  maxPeople: number;
  clubJoin: {
    userId: number;
    status: ClubJoinStatus;
  }[];
};
