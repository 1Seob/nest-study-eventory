import { ApiProperty } from '@nestjs/swagger';
import { MemberDto } from './member.dto';
import { ApplicantData } from '../type/applicant-data.type';

export class ApplicantDto {
  @ApiProperty({
    description: '클럽 가입 신청자들',
    type: [MemberDto],
  })
  applicants!: MemberDto[];

  static from(applicants: ApplicantData[]): ApplicantDto {
    return {
      applicants: applicants.map((applicant) => ({
        userId: applicant.userId,
        status: applicant.status,
      })),
    };
  }
}
