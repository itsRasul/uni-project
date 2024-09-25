import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { CategoryQueryString } from './dtos/category-query-string.dto';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(Category) private categoryRepo: Repository<Category>) {}

  async createCategory(dto: CreateCategoryDto) {
    const createdCategory = this.categoryRepo.create(dto);

    const category = await this.categoryRepo.save(createdCategory);

    return category;
  }

  async deleteCategory(categoryId: number) {
    const { affected } = await this.categoryRepo.delete({
      id: categoryId,
    });

    if (!affected) {
      throw new NotFoundException('category is not found by this id');
    }

    return affected;
  }

  async updateCategory(categoryId: number, dto: UpdateCategoryDto) {
    const { affected } = await this.categoryRepo.update({ id: categoryId }, dto);

    if (!affected) {
      throw new NotFoundException('category is not found by this id');
    }

    return affected;
  }

  async getOneCategory(categoryId: number) {
    const category = await this.categoryRepo.findOne({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('category is not found by this id');
    }

    return category;
  }

  async getAllCategories(queryString: CategoryQueryString) {
    const query = this.categoryRepo.createQueryBuilder('category');
    const feature = new QueryHelper<Category>(query, queryString, 'category')
      .sort()
      .paginate()
      // .limit()
      .fields()
      .filter();

    const categories = await feature.getQuery().execute();
    return categories;
  }

  async findAllByIds(ids: number[] = []) {
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .where('category.id IN (:...ids)', { ids })
      .getMany();

    return categories;
  }

  async getCategoryHierarchy(): Promise<any[]> {
    const rootCategories = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.childCategories', 'childCategories')
      .where('category.parentCategory IS NULL')
      .getMany();

    return await Promise.all(
      rootCategories.map((category) => this.buildCategoryHierarchy(category.id)),
    );
  }

  private async buildCategoryHierarchy(categoryId: number): Promise<any> {
    const category = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.childCategories', 'childCategories')
      .where('category.id = :categoryId', { categoryId })
      .getOne();

    const result = {
      id: category.id,
      name: category.name,
      photo: category.photo,
    };

    if (category.childCategories && category.childCategories.length > 0) {
      result['childCategories'] = await Promise.all(
        category.childCategories.map((child) => this.buildCategoryHierarchy(child.id)),
      );
    }

    return result;
  }

  async getAllSubCategories(category: Category) {
    const subCategories = await this.categoryRepo.find({
      where: {
        parentCategory: {
          id: category.id,
        },
      },
    });

    return subCategories;
  }

  async count() {
    return await this.categoryRepo.count();
  }

  async getOneCategoryWhitAllSubCategoriesAndSubCategories(categoryId: number) {
    const category = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.childCategories', 'childCategory')
      .leftJoinAndSelect('childCategory.childCategories', 'parentCategory')
      .where('category.id = :categoryId', { categoryId })
      .getOne();

    if (!category) {
      throw new NotFoundException('category is not found by this id');
    }

    return category;
  }

  async save(category: Category) {
    return this.categoryRepo.save(category);
  }

  async increaseProductCountField(categories: Category[]) {
    // increase productCount field for all categories which are related to this product
    const promises = categories.map((category: Category) => {
      category.productCount += 1;
      return this.save(category);
    });
    return await Promise.all(promises);
  }

  async decreaseProductCountField(categories: Category[]) {
    // decrease productCount field for all categories which are related to this product
    const promises = categories.map((category: Category) => {
      category.productCount -= 1;
      return this.save(category);
    });
    return await Promise.all(promises);
  }
}
