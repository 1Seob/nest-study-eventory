import { ClubJoinStatus } from '@prisma/client';

export type ApplicantData = {
  userId: number;
  status: ClubJoinStatus;
};
