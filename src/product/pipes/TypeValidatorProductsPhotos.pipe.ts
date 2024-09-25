import { FileValidator } from '@nestjs/common';

interface typeValidatorOptionsType {
  fileType: RegExp;
}

export class TypeValidatorProductPhotos extends FileValidator {
  constructor(protected readonly typeValidatorOptions: typeValidatorOptionsType) {
    super(typeValidatorOptions);
  }

  isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    if (!file.mimetype.match(this.typeValidatorOptions.fileType)) {
      return false;
    }

    return true;
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return 'نوع فایل محصول باید تصویر باشد';
  }
}
