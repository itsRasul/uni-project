import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { OperatorEnum } from '../enums/operator.enum';

@ValidatorConstraint({ name: 'PageValidator', async: false })
export class PageValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    return !isNaN(propertyValue) && propertyValue >= 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `page option must be a positive number`;
  }
}
