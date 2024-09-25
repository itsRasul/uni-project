import { discountTypeEnum } from './enums/discountType.enum';
import { Repository, FindOptionsWhere, MoreThan, LessThan } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Discount } from './entities/discount.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDiscountDto } from './dtos/create-discount.dto';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { Product } from 'src/product/entities/product.entity';
import { ProductService } from 'src/product/product.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { discountStatusEnum } from './enums/discountStatus.enum';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount) private discountRepo: Repository<Discount>,
    private prouctService: ProductService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async activateDiscounts() {
    const discountToBeActivate = await this.discountRepo.find({
      where: {
        startDate: LessThan(new Date()),
        endDate: MoreThan(new Date()),
      },
      relations: ['products'],
    });

    let promises = [];

    for (let discount of discountToBeActivate) {
      discount.status = discountStatusEnum.ACTIVE;
      for (let product of discount.products) {
        this.calculateSellPrice(discount, product);
        promises.push(this.prouctService.save(product));
      }
      promises.push(this.save(discount));
    }

    await Promise.allSettled(promises);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async unActivateExpiredDiscounts() {
    const expiredDiscounts = await this.discountRepo.find({
      where: {
        endDate: LessThan(new Date()),
      },
      relations: ['products'],
    });

    let promises = [];

    for (let discount of expiredDiscounts) {
      discount.status = discountStatusEnum.EXPIRED;
      for (let product of discount.products) {
        this.roleBackSellPrice(product);
        promises.push(this.prouctService.save(product));
      }
      promises.push(this.save(discount));
    }

    await Promise.allSettled(promises);
  }

  async createDiscount(body: CreateDiscountDto) {
    const createdDiscount = this.discountRepo.create(body);

    const discount = await this.discountRepo.save(createdDiscount);

    return discount;
  }

  async findAll(queryString: any) {
    const query = this.discountRepo.createQueryBuilder('discount');
    const feature = new QueryHelper<Discount>(query, queryString, 'discount')
      .sort()
      .paginate()
      .limit()
      .fields()
      .filter();

    const likes = await feature
      .getQuery()
      .leftJoinAndSelect('discount.products', 'product')
      .getMany();

    return likes;
  }

  async applyDiscountToProduct(discount: Discount, product: Product) {
    // if (product.discount && product.discount.active) {
    //   throw new ConflictException('product has active discount');
    // }
    product.discount = discount;

    // calculate sellPrice and change for product
    if (new Date() >= discount.startDate && discount.endDate >= new Date()) {
      this.calculateSellPrice(discount, product);
    }

    await this.prouctService.save(product);

    return true;
  }

  async applyDiscountToMultipleProducts(discount: Discount, products: Product[]) {
    products.forEach((product) => {
      product.discount = discount;
    });

    // calculate sellPrice and change for product
    if (new Date() >= discount.startDate && discount.endDate >= new Date()) {
      products.forEach((product) => {
        this.calculateSellPrice(discount, product);
      });
    }

    const promises = products.map((product) => {
      return this.prouctService.save(product);
    });
    await Promise.allSettled(promises);

    return true;
  }

  async unApplyDiscountForProduct(product: Product) {
    if (!product.discount) {
      throw new BadRequestException('the product has not discount');
    }

    product.discount = null;

    // roll back sellPrice and change for product
    this.roleBackSellPrice(product);

    await this.prouctService.save(product);

    return true;
  }

  calculateSellPrice(discount: Discount, product: Product) {
    if (discount.type === discountTypeEnum.PERCENTAGE) {
      product.sellPrice = product.price - (product.price * discount.value) / 100;
    } else if (discount.type === discountTypeEnum.FIXED) {
      product.sellPrice = product.price - discount.value;
    }
  }

  roleBackSellPrice(product: Product) {
    product.sellPrice = product.price;
  }

  async findBy(dto: FindOptionsWhere<Discount>) {
    const discount = await this.discountRepo.findOne({
      where: dto,
      relations: ['products'],
    });

    if (!discount) {
      throw new NotFoundException('discount is not found by this id');
    }

    return discount;
  }

  async save(discount: Discount) {
    return await this.discountRepo.save(discount);
  }

  async count() {
    return await this.discountRepo.count();
  }
}
