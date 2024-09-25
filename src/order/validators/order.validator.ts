import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { orderSortType } from '../enums/orderSortType.enum';

@ValidatorConstraint({ name: 'SortValidator', async: false })
export class OrderSortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (!propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(orderSortType).some((sortType) => {
      return `order.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(orderSortType).join(', ')}]`;
  }
}
