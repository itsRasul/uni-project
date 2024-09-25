import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { TransactionQueryStringDto } from './dtos/transactionQueryString.dto';
import { CartService } from 'src/cart/cart.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentService } from 'src/payment/payment.service';
import { OrderService } from 'src/order/order.service';
import { GetCheckoutDto } from './dtos/getCheckout.dto';
import { VerifyCheckoutDto } from './dtos/verifyCheckout.dto';
import { transactionStatusEnum } from './enums/transactionStatus.enum';
import { paymentGatewayEnum } from 'src/payment/enums/paymentGateway.enum';
import { transactionTypeEnum } from './enums/transactionType.enum';
import { transcode } from 'buffer';
import { AddressService } from 'src/address/address.service';
import { Response } from 'express';
import { TransactionStateEnum } from './enums/transactionState.enum';
import { orderStatusEnum } from 'src/order/enums/orderStatus.enum';

@Controller('')
export class TransactionController {
  constructor(
    private transactionSerivce: TransactionService,
    private userService: UserService,
    private cartService: CartService,
    private configService: ConfigService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private addressService: AddressService,
  ) { }

  @Post('/api/v1/getCheckout')
  @UseGuards(AuthGuard)
  async getCheckout(@CurrentUser() currentUser: User, @Body() body: GetCheckoutDto) {
    const cart = await this.cartService.findByUserId(currentUser);

    if (cart.cartItems.length === 0) {
      throw new UnprocessableEntityException(
        'لطفا حداقل یک آیتم به سبد خرید خود اضافه کنید سپس امتحان کنید',
      );
    }

    const address = await this.addressService.findBy({
      user: {
        id: currentUser.id,
      },
      id: body.address,
    });

    const resNumber = await this.transactionSerivce.generateResNumber();
    const finalPriceRial = this.transactionSerivce.convertTomanToRial(cart.finalPrice);

    let data = {
      action: 'token',
      TerminalId: this.configService.get<string>('SEP_MERCHANT_ID'),
      Amount: finalPriceRial,
      ResNum: resNumber,
      RedirectURL: this.configService.get<string>('SEP_CALLBACK_URL'),
      CellNumber: body.phoneNumber ?? currentUser.phoneNumber ?? undefined,
    };

    console.log({ data });

    const response = await axios.post(
      this.configService.get<string>('SEP_PAYMENTREQUEST_URL'),
      data,
    );

    console.log(response.data);

    if (response.data.status == 1 && response.data.token) {
      // everything is ok, create a new order for user and sendbacks the link which user going to redirect
      const order = await this.orderService.createOrderForGateway(
        cart.cartItems,
        cart,
        currentUser,
        address,
      );

      console.log({ order });

      const transaction = await this.transactionSerivce.create({
        user: currentUser,
        order: order,
        amount: cart.totalPrice,
        status: transactionStatusEnum.PENDING,
        type: transactionTypeEnum.PURCHASE,
      });

      console.log({ transaction });

      const payment = await this.paymentService.create({
        gateway: paymentGatewayEnum.SAMAN_BANK,
        resNumber: resNumber,
        transaction: transaction,
        user: currentUser,
        refNumber: response.data.token,
      });

      payment.paymentRequest = data;
      payment.paymentResponse = response.data;
      payment.updatedAt = new Date();
      await this.paymentService.save(payment);

      console.log({ payment });

      return {
        message: 'the link for paying is recived successfully',
        link: `${this.configService.get<string>('SEP_PAYMENTRESPONSE_URL')}?token=${response.data.token}`,
      };
    } else {
      console.log(response.data);
      throw new BadRequestException(
        'مشکلی در ارتباط با درگاه پرداخت به وجود آمده است. لطفا از صحت اطلاعات وارد شده اطمینان حاصل فرمایید',
        {
          description: response.data.errorDesc,
        },
      );
    }
  }

  // THIS IS TEMPORARY
  @Post('/api/v1/getCheckoutTest')
  @UseGuards(AuthGuard)
  async getCheckoutTest(@CurrentUser() currentUser: User, @Body() body: GetCheckoutDto) {
    const cart = await this.cartService.findByUserId(currentUser);

    if (cart.cartItems.length === 0) {
      throw new UnprocessableEntityException(
        'لطفا حداقل یک آیتم به سبد خرید خود اضافه کنید سپس امتحان کنید',
      );
    }

    const address = await this.addressService.findBy({
      user: {
        id: currentUser.id,
      },
      id: body.address,
    })

    const resNumber = await this.transactionSerivce.generateResNumber();

    let data = {
      Action: 'token',
      TerminalId: this.configService.get<string>('SEP_MERCHANT_ID'),
      Amount: cart.finalPrice,
      ResNum: resNumber,
      RedirectURL: this.configService.get<string>('SEP_CALLBACK_URL'),
      CellNumber: body.phoneNumber ?? currentUser.phoneNumber ?? undefined,
      GetMethod: true,
    };

    console.log({ data });

    // everything is ok, create a new order for user and sendback the link which user going to redirect
    const order = await this.orderService.createOrderForGateway(
      cart.cartItems,
      cart,
      currentUser,
      address,
    );

    console.log({ order });

    const transaction = await this.transactionSerivce.create({
      user: currentUser,
      order: order,
      amount: cart.totalPrice,
      status: transactionStatusEnum.PENDING,
      type: transactionTypeEnum.PURCHASE,
    });

    console.log({ transaction });

    const payment = await this.paymentService.create({
      gateway: paymentGatewayEnum.SAMAN_BANK,
      resNumber: resNumber,
      transaction: transaction,
      user: currentUser,
      refNumber: '',
    });

    console.log({ payment });

    return {
      message: 'the link for paying is recived successfully',
      link: `${this.configService.get<string>('SEP_PAYMENTRESPONSE_URL')}?token=${1}`,
    };
  }

  @Post('/callback_url')
  async callbackPost(@Body() body: any, @Query() queryString: any, @Res() res: Response) {
    console.log({ body });

    // body sample:
    //  {
    //    MID: '0',
    //    TerminalId: '21578837',
    //    RefNum: '',
    //    ResNum: '119',
    //    State: 'Failed',
    //    TraceNo: '',
    //    Amount: '1000',
    //    Wage: '',
    //    Rrn: '',
    //    SecurePan: '',
    //    Status: '3',
    //    Token: 'ce70adf2ade74c9fbf8ada11a68f3b87',
    //    HashedCardNumber: ''
    //  }

    if (body.State === TransactionStateEnum.OK) {
      console.log('1.body state is ok');
      // transaction is ok, verify the tranaction, update transaction, payment and order status to success, redirect user to front
      // check  RefNumber is not exist in DB, to preventing doublication
      const isPaymentExist = await this.paymentService.isPaymentExistWithRefNum(body.RefNum);

      if (isPaymentExist) {
        return res.redirect(
          `${this.configService.get<string>('CALLBACK_URL_FRONT')}?State=${'RefNumAlreadyExist'}&success=${false}&traceNo=${body.TraceNo}&Rrn=${body.Rrn}&message=${'تراکنش با RefNum تکراری است'}`,
        );
      }

      const verifyRequestData = {
        RefNum: body.RefNum,
        TerminalNumber: this.configService.get<string>('SEP_MERCHANT_ID'),
      };
      const verifyResponse = await axios.post(
        this.configService.get<string>('SEP_VERIFY_TRANSACTION'),
        verifyRequestData,
      );

      // verifyResponse sample:
      // {
      //   " TransactionDetail": {
      //   "RRN": "14226761817",
      //   "RefNum": "50",
      //   "MaskedPan": "621986****8080",
      //   "HashedPan":
      //   "b96a14400c3a59249e87c300ecc06e5920327e70220213b5bbb7d7b2410f7e0d",
      //   "TerminalNumber": 2001,
      //   "OrginalAmount": 1000,
      //   "AffectiveAmount": 1000,
      //   "StraceDate": "2019-09-16 18:11:06",
      //   "StraceNo": "100428"
      //   },
      //   "ResultCode": 0,
      //   "ResultDescription": "عملیات با موفقیت انجام شد",
      //   "Success": true
      // }

      console.log(verifyResponse.data);
      if (verifyResponse.data.Success) {
        console.log('3.verify response is verified');
        // transaction is verified

        // find payment and update fields

        const payment = await this.paymentService.findBy({ resNumber: body.ResNum });
        payment.verifyRequest = verifyRequestData;
        payment.verifyResponse = verifyResponse.data;
        payment.paymentCallback = body;
        payment.updatedAt = new Date();
        await this.paymentService.save(payment);

        console.log({ payment });

        // find transaction and update status to success

        const transaction = await this.transactionSerivce.findBy({
          payment: {
            id: payment.id,
          },
        });
        transaction.status = transactionStatusEnum.SUCCESSFUL;
        transaction.finishedAt = new Date();
        transaction.traceNo = body.TraceNo;
        transaction.Rrn = body.Rrn;
        await this.transactionSerivce.save(transaction);

        // find order and update status

        const order = await this.orderService.findBy({
          transactions: {
            id: transaction.id,
          },
        });
        order.status = orderStatusEnum.PAID;
        order.updatedAt = new Date();
        await this.orderService.save(order);

        // redirect user to front
        return res.redirect(
          `${this.configService.get<string>('CALLBACK_URL_FRONT')}?State=${body.State}&success=${true}&traceNo=${body.TraceNo}&Rrn=${body.Rrn}&message=${'تراکنش با موفقیت انجام شد'}&resultCode=${verifyResponse.data.ResultCode}&resultDescription=${verifyResponse.data.ResultDescription}`,
        );
      } else {
        // transaction is not verified
        console.log('3.verify response is not verified');

        const payment = await this.paymentService.findBy({ resNumber: body.ResNum });
        payment.verifyRequest = verifyRequestData;
        payment.verifyResponse = verifyResponse.data;
        payment.paymentCallback = body;
        payment.updatedAt = new Date();
        await this.paymentService.save(payment);

        console.log({ payment });

        const transaction = await this.transactionSerivce.findBy({
          payment: {
            id: payment.id,
          },
        });
        transaction.status = transactionStatusEnum.FAILD;
        transaction.finishedAt = new Date();
        transaction.traceNo = body.TraceNo;
        transaction.Rrn = body.Rrn;
        await this.transactionSerivce.save(transaction);

        const order = await this.orderService.findBy({
          transactions: {
            id: transaction.id,
          },
        });
        order.status = orderStatusEnum.CANCELED;
        order.updatedAt = new Date();
        await this.orderService.save(order);

        return res.redirect(
          `${this.configService.get<string>('CALLBACK_URL_FRONT')}?State=${body.State}&success=${false}&message=${'تراکنش تایید نشد، در صورت کسر وجه، طی 72 ساعت آینده مبلغ به حساب شما واریز میشود'}&resultCode=${verifyResponse.data.ResultCode}&resultDescription=${verifyResponse.data.ResultDescription}`,
        );
      }
    } else {
      // transaction is faild, update transaction, payment and order status to failed, redirect user to front
      console.log('2.body state is ok');

      const payment = await this.paymentService.findBy({ resNumber: body.ResNum });
      payment.paymentCallback = body;
      payment.updatedAt = new Date();
      await this.paymentService.save(payment);

      console.log({ payment });

      // find transaction and update status to success

      const transaction = await this.transactionSerivce.findBy({
        payment: {
          id: payment.id,
        },
      });
      transaction.status = transactionStatusEnum.FAILD;
      transaction.finishedAt = new Date();
      await this.transactionSerivce.save(transaction);

      // find order and update status

      const order = await this.orderService.findBy({
        transactions: {
          id: transaction.id,
        },
      });
      order.status = orderStatusEnum.CANCELED;
      order.updatedAt = new Date();
      await this.orderService.save(order);

      return res.redirect(
        `${this.configService.get<string>('CALLBACK_URL_FRONT')}?State=${body.State}&success=${false}&message=${'تراکنش انجام نشد'}`,
      );
    }
  }

  @Get('/api/v1/transactions')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllTransactions(@Query() queryString: TransactionQueryStringDto) {
    const transactions = await this.transactionSerivce.getAllTransactions(queryString);

    const count = await this.transactionSerivce.count()

    return {
      status: 'success',
      message: 'all transactions are received successfully',
      data: {
        count,
        transactions,
      },
    };
  }

  @Get('/api/v1/transactions/:transctionId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getOneTransactions(@Param('transctionId', ParseIntPipe) transctionId: number) {
    const transaction = await this.transactionSerivce.findBy({ id: transctionId }, [
      'payment',
      'order',
      'user',
    ]);

    return {
      status: 'success',
      message: 'transaction is received successfully',
      data: {
        transaction,
      },
    };
  }

  @Get('/api/v1/me/transactions')
  @UseGuards(AuthGuard)
  async getAllMyTransactions(
    @Query() queryString: TransactionQueryStringDto,
    @CurrentUser() user: User,
  ) {
    const transactions = await this.transactionSerivce.getAllTransactionsBelongingToAUser(
      queryString,
      user,
    );
    const count = await this.transactionSerivce.count({
      user: {
        id: user.id
      }
    })

    return {
      status: 'success',
      message: 'your all transactions are received successfully',
      data: {
        count,
        transactions,
      },
    };
  }

  @Get('/api/v1/users/:userId/transactions')
  @UseGuards(AuthGuard)
  async getAllTransactionsBelongingToAUser(
    @Query() queryString: TransactionQueryStringDto,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const user = await this.userService.findById(userId);
    const transactions = await this.transactionSerivce.getAllTransactionsBelongingToAUser(
      queryString,
      user,
    );

    return {
      status: 'success',
      message: 'all transactions belonging the user are received successfully',
      data: {
        transactions,
      },
    };
  }

  @Get('/api/v1/me/transactions/:trasnactionId')
  @UseGuards(AuthGuard)
  async getOneMyTransaction(
    @Param('trasnactionId', ParseIntPipe) trasnactionId: number,
    @CurrentUser() user: User,
  ) {
    const transaction = await this.transactionSerivce.findBy(
      {
        id: trasnactionId,
        user: {
          id: user.id,
        },
      },
      ['payment', 'order'],
    );

    return {
      status: 'success',
      message: 'the transaction belonging to you is received successfully',
      data: {
        transaction,
      },
    };
  }
}
