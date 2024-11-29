import { ClubJoinStatus } from '@prisma/client';

export type MemberData = {
  userId: number;
  status: ClubJoinStatus;
};

export type ClubData = {
  id: number;
  hostId: number;
  title: string;
  description: string;
  maxPeople: number;
  clubJoin: MemberData[];
};
