import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { Repository, FindOptionsWhere } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(@InjectRepository(Payment) private paymentRepo: Repository<Payment>) {}

  async create(body: Partial<Payment>) {
    const createdPayment = this.paymentRepo.create(body);

    return await this.paymentRepo.save(createdPayment);
  }

  async findBy(where: FindOptionsWhere<Payment>) {
    const payment = await this.paymentRepo.findOne({ where });

    if (!payment) {
      throw new NotFoundException('payment not found');
    }

    return payment;
  }

  async isPaymentExistWithRefNum(refNum: string) {
    const payment = await this.paymentRepo.findOne({ where: { refNumber: refNum } });

    if (payment) {
      return true;
    }

    return false;
  }

  async save (payment: Payment) {
    return await this.paymentRepo.save(payment)
  }
}
