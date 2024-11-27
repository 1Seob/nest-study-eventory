import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { User, Category } from '@prisma/client';
import { UpdateUserData } from 'src/auth/type/update-user-data.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name,
        email: data.email,
        birthday: data.birthday,
        cityId: data.cityId,
        categoryId: data.categoryId,
      },
    });
  }

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    return !!user;
  }

  async getCategoryById(categoryId: number): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });
  }

  async getCityById(cityId: number): Promise<Category | null> {
    return this.prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
