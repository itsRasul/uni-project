import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CooperatorSortType } from '../enums/cooperatorSortType.enum';

@ValidatorConstraint({ name: 'CooperatorSortValidator', async: false })
export class CooperatorSortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (!propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(CooperatorSortType).some((sortType) => {
      return `cooperator.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(CooperatorSortType).join(', ')}]`;
  }
}
