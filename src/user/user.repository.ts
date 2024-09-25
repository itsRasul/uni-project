import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './User.entity';
import { Repository } from 'typeorm';
import { updateUserNonSensitiveDataByAdminDto } from './dtos/UpdateUserNonSensitiveDataByAdmin.dto';
import { updateMeDto } from './dtos/UpdateMe.dto';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { UserQueryStringDto } from './dtos/user-query-string.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll(queryString: UserQueryStringDto) {
    const query = this.userRepo.createQueryBuilder('user');
    const feature = new QueryHelper<User>(query, queryString, 'user')
      .sort()
      .paginate()
      .limit()
      .fields()
      .filter()
      .search('email');

    const users = await feature.getQuery().getMany();
    return users;
  }

  async findById(userId: number) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException('user is not found by this id');
    }

    return user;
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    let user = await this.userRepo.findOne({ where: { phoneNumber } });

    if (!user) {
      throw new NotFoundException('A user with this profile was not found');
    }

    return user;
  }

  async findByEmailOrCreate(email: string, userData: Partial<User>): Promise<User> {
    let user: User | null;
    user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = this.userRepo.create(userData);
      await this.userRepo.save(user);
    }

    return user;
  }

  async createUser(dto: Partial<User>) {
    const user = this.userRepo.create(dto);
    return await this.userRepo.save(user);
  }

  async isThereUserByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { phoneNumber } });

    return user ? true : false;
  }

  async findOneByEmailOrPhoneNumber(email: string | undefined, phoneNumber: string | undefined) {
    let user: User = null;
    let queryOption = null;

    if (email) {
      queryOption = { email };
    } else if (phoneNumber) {
      queryOption = { phoneNumber };
    }

    user = await this.userRepo.findOne({
      where: queryOption,
    });

    if (!user) {
      throw new BadRequestException('User with this profile was not found');
    }

    return user;
  }

  async findOneByResetPasswordToken(hashedResetPasswordToken: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where(`user.resetPassword #>> '{token}' = :hashedResetPasswordToken`, {
        hashedResetPasswordToken,
      })
      .andWhere(`user.resetPassword #>> '{expires}' > :now`, { now: new Date().toISOString() })
      .getOne();

    if (!user) {
      throw new NotFoundException('The code entered is incorrect or has expired');
    }

    return user;
  }

  async deleteUserById(userId: number) {
    const { raw, affected } = await this.userRepo.delete({ id: userId });

    if (!affected) {
      throw new NotFoundException('user is not found by this id');
    }

    return affected;
  }

  async updateUserByIdNonSensitiveData(userId: number, body: updateUserNonSensitiveDataByAdminDto) {
    if (!Object.keys(body).length) {
      throw new BadRequestException('body must not to be empty');
    }

    const { raw, affected } = await this.userRepo.update({ id: userId }, body);

    if (!affected) {
      throw new NotFoundException('user is not found by this id');
    }

    return affected;
  }

  async updateMe(user: User, body: updateMeDto) {
    if (!Object.keys(body).length) {
      throw new BadRequestException('body must not to be empty');
    }

    const { raw, affected } = await this.userRepo.update({ id: user.id }, body);

    if (!affected) {
      throw new NotFoundException('user is not found by this id');
    }

    return affected;
  }

  async findOneByRefreshToken(refreshToken: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where(':refreshToken = ANY(user.refresh_token)', { refreshToken })
      .getOne();

    return user;
  }
}
