import { Repository, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private tagRepo: Repository<Tag>) {}

  async findOrCreate(name: string[]) {
    const tags: Tag[] = [];
    for (let i = 0; i < name.length; i++) {
      let tag: Tag;
      tag = await this.tagRepo.findOne({ where: { name: name[i] } });

      if (!tag) {
        const createdTag = this.tagRepo.create({ name: name[i] });
        tag = await this.tagRepo.save(createdTag);
      }

      await this.increaseProductCount(tag);

      tags.push(tag);
    }

    return tags;
  }

  async increaseProductCount(tag: Tag) {
    tag.productCount += 1;
    return await this.tagRepo.save(tag);
  }

  async getAllTags(queryString: any) {
    const query = this.tagRepo.createQueryBuilder('tag');
    const feature = new QueryHelper<Tag>(query, queryString, 'tag')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter();

    const tags = await feature.getQuery().getMany();

    return tags;
  }

  async count(where: FindOptionsWhere<Tag> = {}) {
    return await this.tagRepo.count({ where });
  }
}
