import { Repository, FindOptionsWhere } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Cooperator } from './entities/cooperator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { UpdateCooperatorDto } from './dtos/update-cooperator.dto';
import { CooperatorStatusEnum } from './enums/cooperator-status.enum';

@Injectable()
export class CooperatorService {
  constructor(@InjectRepository(Cooperator) private cooperatorRepo: Repository<Cooperator>) {}

  async createCooperator(body: Partial<Cooperator>) {
    const createdCooperator = this.cooperatorRepo.create(body);
    const cooperator = await this.cooperatorRepo.save(createdCooperator);
    return cooperator;
  }

  async findAll(queryString: any) {
    const query = this.cooperatorRepo.createQueryBuilder('cooperator');
    const feature = new QueryHelper<Cooperator>(query, queryString, 'cooperator')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter();

    const cooperators = await feature
      .getQuery()
      .leftJoinAndSelect('cooperator.shop', 'shop')
      .leftJoinAndSelect('cooperator.categories', 'category')
      .getMany();

    return cooperators;
  }

  async count(where: FindOptionsWhere<Cooperator> = {}) {
    return await this.cooperatorRepo.count({ where });
  }

  async findBy(where: FindOptionsWhere<Cooperator>, relations: string[] = []) {
    const cooper = await this.cooperatorRepo.findOne({ where, relations });

    if (!cooper) {
      throw new NotFoundException('cooperator is not found');
    }

    return cooper;
  }

  async updateCooperator(cooperId: number, body: UpdateCooperatorDto) {
    const cooper = await this.cooperatorRepo.findOne({ where: { id: cooperId } });

    if (!cooper) {
      throw new NotFoundException('cooperator is not found');
    }

    const data: Partial<Cooperator> = {};
    if (body.status === CooperatorStatusEnum.ACCEPTED) {
      data.cooperationStartDate = new Date();
    }
    if (body.status === CooperatorStatusEnum.END_COOPERATION) {
      data.cooperationEndDate = new Date();
    }
    Object.assign(cooper, { ...body, ...data });

    return await this.cooperatorRepo.save(cooper);
  }
}
