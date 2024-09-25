import { Module } from '@nestjs/common';
import { CooperatorService } from './cooperator.service';
import { CooperatorController } from './cooperator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cooperator } from './entities/cooperator.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { ShopModule } from 'src/shop/shop.module';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cooperator]),UserModule, ShopModule, CategoryModule],
  providers: [CooperatorService],
  controllers: [CooperatorController],
  exports: [CooperatorService]
})
export class CooperatorModule {}
