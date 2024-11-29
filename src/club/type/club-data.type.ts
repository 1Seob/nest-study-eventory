import { ClubJoinStatus } from '@prisma/client';

export type ClubData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  maxPeople: number;
  members: {
    userId: number;
    status: ClubJoinStatus;
  }[];
};
