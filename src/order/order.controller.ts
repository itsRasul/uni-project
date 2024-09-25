import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UpdateShippingInfoDto } from './dtos/update-shipping-info.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { OrderQueryStringDto } from './dtos/order-query-string.dto';

@Controller('/api/v1')
export class OrderController {
  constructor(private orderService: OrderService) {}

  // THIS IS TEMPORARY CONTROLLER
  // @Post('/orders')
  // @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  // @HttpCode(HttpStatus.CREATED)
  // async createOrder(@Body() body: CreateOrderDto, @CurrentUser() user: User) {
  //   const order = await this.orderService.createOrder(body, user);

  //   return order;
  // }

  @Get('orders')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllOrders(@Query() queryString: OrderQueryStringDto) {
    const orders = await this.orderService.getAllOrders(queryString);
    const ordersCount = await this.orderService.count();

    return {
      status: 'success',
      message: 'all orders are received successfully',
      data: {
        count: ordersCount,
        orders,
      },
    };
  }

  @Get('orders/:orderId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async geOneOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    const order = await this.orderService.findBy({ id: orderId });

    return {
      status: 'success',
      message: 'order is received successfully',
      data: {
        order,
      },
    };
  }

  @Patch('orders/:orderId/shippingInfo')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async updateShippingInfo(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: UpdateShippingInfoDto,
  ) {
    const order = await this.orderService.findBy({ id: orderId });
    const shippingInfo = await this.orderService.updateShippingInfo(order.shippingInfo.id, body)


    return {
      status: 'success',
      message: 'order is updated successfully',
      data: {
        shippingInfo,
      },
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Delete('orders/:orderId')
  async deleteOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    const order = await this.orderService.deleteOrder(orderId);

    return {
      status: 'success',
      message: 'order is deleted successfully',
      data: {
        order,
      },
    };
  }

  @Get('/me/orders')
  @UseGuards(AuthGuard)
  async getAllMyOrders(@Query() queryString: OrderQueryStringDto, @CurrentUser() user: User) {
    const orders = await this.orderService.getAllMyOrders(user, queryString);
    const myOrdersCount = await this.orderService.count({
      user: {
        id: user.id,
      },
    });

    return {
      status: 'success',
      message: 'all your orders are received successfully',
      data: {
        count: myOrdersCount,
        orders,
      },
    };
  }
}
