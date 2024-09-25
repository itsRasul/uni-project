import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { QueryHelper } from 'src/common/utilities/QueryHelper.util';
import { User } from 'src/user/User.entity';
import { transactionStatusEnum } from './enums/transactionStatus.enum';
import { GetIncomeDiagramDto } from 'src/common/dtos/get-income-diagram.dto';

@Injectable()
export class TransactionService {
  constructor(@InjectRepository(Transaction) private transactionRepo: Repository<Transaction>) { }

  async getAllTransactions(queryString: any) {
    const query = this.transactionRepo.createQueryBuilder('transaction');
    const feature = new QueryHelper<Transaction>(query, queryString, 'transaction')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter();

    const transactions = await feature
      .getQuery()
      .leftJoinAndSelect('transaction.order', 'order')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .leftJoinAndSelect('transaction.user', 'user')
      .getMany();

    return transactions;
  }

  async findBy(where: FindOptionsWhere<Transaction>, relations: string[] = []) {
    const transaction = await this.transactionRepo.findOne({ where, relations });

    if (!transaction) {
      throw new NotFoundException('transaction is not found succesfully');
    }

    return transaction;
  }

  async getAllTransactionsBelongingToAUser(queryString: any, user: User) {
    const query = this.transactionRepo.createQueryBuilder('transaction');
    const feature = new QueryHelper<Transaction>(query, queryString, 'transaction')
      .sort()
      .limit()
      .paginate()
      .fields()
      .filter();

    const transactions = await feature
      .getQuery()
      .leftJoinAndSelect('transaction.order', 'order')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .leftJoinAndSelect('transaction.user', 'user')
      .andWhere('transaction.user.id = :userId', { userId: user.id })
      .getMany();

    return transactions;
  }

  async count(where: FindOptionsWhere<Transaction> = {}) {
    return await this.transactionRepo.count({ where });
  }

  async calculateTotalIncome() {
    const totalIncome = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalIncome')
      .where('transaction.status = :status', { status: transactionStatusEnum.SUCCESSFUL })
      .getRawOne();
    return totalIncome;
  }

  async calculateTodayIncome() {
    const currentDate = new Date();

    // Set the time to the beginning of today
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set the time to the end of today
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const totalIncome = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'todayIncome')
      .where('transaction.status = :status', { status: transactionStatusEnum.SUCCESSFUL })
      .andWhere('transaction.createdAt >= :startOfDay', { startOfDay }) // Compare with the beginning of today
      .andWhere('transaction.createdAt <= :endOfDay', { endOfDay }) // Compare with the end of today
      .getRawOne();
    return totalIncome;
  }

  async calculateMonthIncome() {
    // Get the current date
    const currentDate = new Date();

    // Calculate the start date of the recent month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const totalIncome = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'mouthIncome')
      .where('transaction.status = :status', { status: transactionStatusEnum.SUCCESSFUL })
      .andWhere('transaction.createdAt >= :startOfMonth', { startOfMonth })
      .getRawOne();
    return totalIncome;
  }

  async incomeDiagram(body: GetIncomeDiagramDto) {
    const query = `
    SELECT
      EXTRACT(day FROM created_At) as "day",
      SUM(amount) as "value",
      EXTRACT(month FROM created_At) as "month",
      EXTRACT(year FROM created_At) as "year",
      to_char(date_trunc('day', created_At), 'YYYY-MM-DD') as date
    FROM
      Transactions
    WHERE
      status = $1
      AND EXTRACT(month FROM created_At) = $2
      AND EXTRACT(year FROM created_At) = $3
    GROUP BY
      EXTRACT(day FROM created_At),
      EXTRACT(month FROM created_At),
      EXTRACT(year FROM created_At),
      date
    ORDER BY
      EXTRACT(year FROM created_At),
      EXTRACT(month FROM created_At),
      EXTRACT(day FROM created_At);
  `;

    const result = await this.transactionRepo.query(query, [
      transactionStatusEnum.SUCCESSFUL,
      body.mounth,
      body.year,
    ]);

    return result;
  }

  async generateResNumber(): Promise<string> {
    let resNum: number;

    const lastTransaction = await this.transactionRepo
      .createQueryBuilder('transaction')
      .orderBy('transaction.createdAt', 'DESC')
      .getOne();

    resNum = lastTransaction ? lastTransaction.id : 1;

    return `${resNum}`;
  }

  async create(body: Partial<Transaction>) {
    const createdTransaction = this.transactionRepo.create(body);

    return await this.transactionRepo.save(createdTransaction);
  }

  async save(transaction: Transaction) {
    return await this.transactionRepo.save(transaction);
  }

  convertTomanToRial(amount: number) {
    return Number(`${amount}${0}`);
  }
}
