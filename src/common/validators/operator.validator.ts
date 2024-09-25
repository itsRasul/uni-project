import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { OperatorEnum } from '../enums/operator.enum';

@ValidatorConstraint({ name: 'OperatorValidator', async: false })
export class OperatorValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    console.log({ propertyValue });
    // propertyValue => { '>=': 1000 }
    return Object.keys(propertyValue).some((operatorKey: OperatorEnum) => {
      return Object.values(OperatorEnum).includes(operatorKey);
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `operator must be one of these values: ${Object.values(OperatorEnum).join(', ')}`;
  }
}
