import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { CreateAddressDto } from './dtos/create-address.dto';

@Controller('/api/v1')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('/addresses')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createMyAddress(@Body() body: CreateAddressDto, @CurrentUser() user: User) {
    const address = await this.addressService.createAddress(body, user);

    return {
      status: 'success',
      message: 'your address is created successfully',
      data: {
        address,
      },
    };
  }

  @Delete('/addresses/:addressId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyAddress(
    @Param('addressId', ParseIntPipe) addressId: number,
    @CurrentUser() user: User,
  ) {
    const affected = await this.addressService.deleteMyAddress(addressId, user);

    return {
      status: 'success',
      message: 'your address is deleted successfully',
      data: {
        affected,
      },
    };
  }

  @Get('/me/addresses')
  @UseGuards(AuthGuard)
  async getAllMyAddresses (@CurrentUser() user: User) {
    const addresses = await this.addressService.getAllAddressesBelongingtoAUser(user)

    return {
      status: 'success',
      message: 'all your addresses are received successfully',
      data: {
        addresses,
      },
    };
  }
}
