import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class JoinEventPayload {
    @IsInt()
    @ApiProperty({
        description: '모임 참가자 ID',
        type: Number,
    })
    userId!: number;
}