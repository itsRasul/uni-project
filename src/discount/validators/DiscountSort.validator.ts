import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { discountSortType } from '../enums/discountSortType.enum';

@ValidatorConstraint({ name: 'DiscountSortValidator', async: false })
export class DiscountSortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (!propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(discountSortType).some((sortType) => {
      return `discount.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(discountSortType).join(', ')}]`;
  }
}
