import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { OperatorEnum } from '../enums/operator.enum';

@ValidatorConstraint({ name: 'LimitValidator', async: false })
export class LimitValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    return !isNaN(propertyValue) && propertyValue >= 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `limit option must be a positive number`;
  }
}
