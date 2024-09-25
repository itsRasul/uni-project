import { FileValidator } from '@nestjs/common';

interface MaxSizeValidatorProductFilesOptionType {
  maxSize: number;
}

export class MaxSizeValidatorProductPhotos extends FileValidator {
  constructor(protected readonly validationOption: MaxSizeValidatorProductFilesOptionType) {
    super(validationOption);
  }

  isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    if (file.size > this.validationOption.maxSize * 1000000) {
      return false;
    }

    return true;
  }

  buildErrorMessage(file: any) {
    return 'حجم فایل بارگذاری شده بیشتر از حد مجاز است. تصاویر محصول باید کمتر از 2 مگابایت باشد';
  }
}
