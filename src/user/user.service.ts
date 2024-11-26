import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { UserDto } from './dto/user.dto';
import { UpdateUserPayload } from './payload/update-user.payload';
import { UpdateUserData } from 'src/auth/type/update-user-data.type';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: number): Promise<UserDto> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return UserDto.from(user);
  }

  async updateUser(
    userId: number,
    payload: UpdateUserPayload,
    user: UserBaseInfo,
  ): Promise<UserDto> {
    const data = this.validateNullOf(payload);
    const targetUser = await this.userRepository.getUserById(user.id);
    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    if (userId !== user.id) {
      throw new ForbiddenException('본인만 수정할 수 있습니다.');
    }
    if (data.email) {
      const isEmailExist = await this.userRepository.isEmailExist(data.email);
      if (isEmailExist) {
        throw new ConflictException('이미 사용중인 이메일입니다.');
      }
    }
    if (data.categoryId) {
      const category = await this.userRepository.getCategoryById(
        data.categoryId,
      );
      if (!category) {
        throw new NotFoundException('존재하지 않는 카테고리입니다.');
      }
    }
    if (data.cityId) {
      const city = await this.userRepository.getCityById(data.cityId);
      if (!city) {
        throw new NotFoundException('존재하지 않는 도시입니다.');
      }
    }
    const updatedUser = await this.userRepository.updateUser(userId, data);
    return UserDto.from(updatedUser);
  }

  async deleteUser(userId: number, user: UserBaseInfo): Promise<void> {
    if (userId !== user.id) {
      throw new ForbiddenException('본인만 삭제할 수 있습니다.');
    }
    return this.userRepository.deleteUser(userId);
  }

  private validateNullOf(payload: UpdateUserPayload): UpdateUserData {
    if (payload.categoryId === null) {
      throw new BadRequestException('categoryId는 null일 수 없습니다.');
    }
    if (payload.name === null) {
      throw new BadRequestException('name은 null일 수 없습니다.');
    }
    if (payload.email === null) {
      throw new BadRequestException('email은 null일 수 없습니다.');
    }
    return {
      categoryId: payload.categoryId,
      name: payload.name,
      email: payload.email,
      birthday: payload.birthday,
      cityId: payload.cityId,
    };
  }
}
