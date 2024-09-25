import { LessThan, MoreThan } from 'typeorm';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guard/auth.guard';
import { RolesGuardFactory } from './auth/guard/roles.guard';
import userRolesEnum from './user/enums/userRoles.enum';
import { UserService } from './user/user.service';
import { ProductService } from './product/product.service';
import { LikeService } from './like/like.service';
import { ReviewService } from './review/services/review.service';
import { OrderService } from './order/order.service';
import { TransactionService } from './transaction/transaction.service';
import { CooperatorService } from './cooperator/cooperator.service';
import { orderStatusEnum } from './order/enums/orderStatus.enum';
import { CooperatorRoleEnum } from './cooperator/enums/cooperator-role.enum';
import { transactionStatusEnum } from './transaction/enums/transactionStatus.enum';
import { GetIncomeDiagramDto } from './common/dtos/get-income-diagram.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UserService,
    private productService: ProductService,
    private likeService: LikeService,
    private reviewService: ReviewService,
    private orderService: OrderService,
    private trasactionService: TransactionService,
    private cooperatorService: CooperatorService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/api/v1/dashboard/stats')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getDashboardStats() {
    const totalUsersCount = await this.usersService.count();
    const totalProductsCount = await this.productService.count();
    const totalLikesCount = await this.likeService.count();
    const totalReviewsCount = await this.reviewService.count();
    const totalSuccessfulOrdersCount = await this.orderService.count({ status: orderStatusEnum.PAID });
    const totalSuccessfulTransactionCount = await this.trasactionService.count({ status: transactionStatusEnum.SUCCESSFUL });
    const totalCooperatorCount = await this.cooperatorService.count();
    const totalCooperatorSeller = await this.cooperatorService.count({
      role: CooperatorRoleEnum.SELLER,
    });
    const totalCooperatorMarketer = await this.cooperatorService.count({
      role: CooperatorRoleEnum.MARKETER,
    });
    const totalCooperatorSupplier = await this.cooperatorService.count({
      role: CooperatorRoleEnum.SUPPLIER,
    });
    const { totalIncome } = await this.trasactionService.calculateTotalIncome();
    const { todayIncome } = await this.trasactionService.calculateTodayIncome();
    const { mouthIncome } = await this.trasactionService.calculateMonthIncome();

    return {
      status: 'success',
      message: 'all stats are received successfully',
      data: {
        totalUsersCount,
        totalProductsCount,
        totalLikesCount,
        totalReviewsCount,
        totalSuccessfulTransactionCount,
        totalSuccessfulOrdersCount,
        cooperators: {
          totalCount: totalCooperatorCount,
          totalSellerCount: totalCooperatorSeller,
          totalMarketerCount: totalCooperatorMarketer,
          totalSupplierCount: totalCooperatorSupplier,
        },
        income: {
          totalIncome: totalIncome ?? '0',
          todayIncome: todayIncome ?? '0',
          mouthIncome: mouthIncome ?? '0',
        }
      },
    };
  }

  @Post('/api/v1/dashboard/stats/income-diagram')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getIncomeDiagramData (@Body() body: GetIncomeDiagramDto) {
    const incomeDiagram = await this.trasactionService.incomeDiagram(body)

    return {
      status: 'success',
      message: 'income diagram data is reiceved successfully',
      data: {
        incomeDiagram
      }
    }
  }
}
