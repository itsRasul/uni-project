import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { TransactionSortType } from '../enums/transactionSortType.enum';

@ValidatorConstraint({ name: 'TransactionSortValidator', async: false })
export class TransactionSortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (!propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(TransactionSortType).some((sortType) => {
      return `transaction.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(TransactionSortType).join(', ')}]`;
  }
}
