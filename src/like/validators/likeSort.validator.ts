import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { likeSortType } from '../enums/likeSortType.enum';

@ValidatorConstraint({ name: 'SortValidator', async: false })
export class LikeSortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (!propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(likeSortType).some((sortType) => {
      return `like.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(likeSortType).join(', ')}]`;
  }
}
