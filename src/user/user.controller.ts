import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { UpdateUserPayload } from './payload/update-user.payload';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userId')
  @ApiOperation({ summary: '유저 조회' })
  @ApiOkResponse({ type: UserDto })
  async getUserById(@Param('userId') userId: number): Promise<UserDto> {
    return this.userService.getUserById(userId);
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 정보 수정' })
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('userId') userId: number,
    @Body() payload: UpdateUserPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, payload, user);
  }

  @Delete(':userId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiNoContentResponse()
  async deleteUser(
    @Param('userId') userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.userService.deleteUser(userId, user);
  }
}
