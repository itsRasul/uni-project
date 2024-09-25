import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SignUpSupplierDto } from './dtos/sign-up-supplier.dto';
import { EntityManager } from 'typeorm';
import { CooperatorService } from './cooperator.service';
import { Cooperator } from './entities/cooperator.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { CooperatorRoleEnum } from './enums/cooperator-role.enum';
import { SignUpDistributorDto } from './dtos/sign-up-distributor.dto';
import { SignUpMarketerDto } from './dtos/sign-up-marketer.dto';
import { UpdateCooperatorDto } from './dtos/update-cooperator.dto';
import { CategoryService } from 'src/category/category.service';
import { CooperatorQueryStringDto } from './dtos/cooperator-query-string.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';

@Controller('/api/v1/cooperators')
export class CooperatorController {
  constructor(
    private entityManager: EntityManager,
    private cooperatorService: CooperatorService,
    private categoryService: CategoryService,
  ) {}

  @Post('sign-up/seller')
  @HttpCode(HttpStatus.CREATED)
  async signUpSupplier(@Body() body: SignUpSupplierDto) {
    return await this.entityManager.transaction(async (entityManager: EntityManager) => {
      const categories = await this.categoryService.findAllByIds(body.cooperator.categories);
      const createdCooperator = entityManager.create(Cooperator, {
        ...body.cooperator,
        categories,
        role: CooperatorRoleEnum.SELLER,
      });
      const cooperator = await entityManager.save(createdCooperator);

      const createdShop = entityManager.create(Shop, { ...body.shop, cooperator });
      const shop = await entityManager.save(createdShop);

      return {
        status: 'success',
        message: 'you are sign up as a supplier',
        data: {
          cooperator,
          shop,
        },
      };
    });
  }

  @Post('sign-up/supplier')
  @HttpCode(HttpStatus.CREATED)
  async signUpDistributor(@Body() body: SignUpDistributorDto) {
    const categories = await this.categoryService.findAllByIds(body.cooperator.categories);

    const cooper = await this.cooperatorService.createCooperator({
      ...body.cooperator,
      categories,
      role: CooperatorRoleEnum.SUPPLIER,
    });

    return {
      status: 'success',
      message: 'you are signed up as a distributor',
      data: {
        cooper,
      },
    };
  }

  @Post('sign-up/marketer')
  @HttpCode(HttpStatus.CREATED)
  async signUpMarketer(@Body() body: SignUpMarketerDto) {
    const categories = await this.categoryService.findAllByIds(body.cooperator.categories);

    const cooper = await this.cooperatorService.createCooperator({
      ...body.cooperator,
      categories,
      role: CooperatorRoleEnum.MARKETER,
    });

    return {
      status: 'success',
      message: 'you are signed up as a marketer',
      data: {
        cooper,
      },
    };
  }

  @Get('/')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllCooperators(@Query() queryString: CooperatorQueryStringDto) {
    const cooperators = await this.cooperatorService.findAll(queryString);
    const cooperatorsCount = await this.cooperatorService.count();

    return {
      status: 'success',
      message: 'all cooperators are received successfully',
      data: {
        count: cooperatorsCount,
        cooperators,
      },
    };
  }

  @Get('/:cooperatorId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getOneCooperators(@Param('cooperatorId', ParseIntPipe) cooperatorId: number) {
    const cooperator = await this.cooperatorService.findBy({ id: cooperatorId }, [
      'shop',
      'categories',
    ]);

    return {
      status: 'success',
      message: 'cooperator is received successfully',
      data: { cooperator },
    };
  }

  @Patch('/:cooperatorId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateCooperator(
    @Param('cooperatorId', ParseIntPipe) cooperatorId: number,
    @Body() body: UpdateCooperatorDto,
  ) {
    const cooperator = await this.cooperatorService.updateCooperator(cooperatorId, body);

    return {
      status: 'success',
      message: 'cooperator is received successfully',
      data: { cooperator },
    };
  }
}
