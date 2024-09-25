import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CategorySortType } from '../enums/categorySortType.enum';

@ValidatorConstraint({ name: 'CategorySortValidator', async: false })
export class CategorySortValidator implements ValidatorConstraintInterface {
  validate(propertyValue: any, args: ValidationArguments) {
    // propertyValue => "-createdAt"
    if (propertyValue) return true;
    const propertyValueString = propertyValue.substring(1);
    // propertyValueString => "createdAt"
    return Object.values(CategorySortType).some((sortType) => {
      return `category.${sortType}` === propertyValueString;
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `sort option must be one of these: [${Object.values(CategorySortType).join(', ')}]`;
  }
}
