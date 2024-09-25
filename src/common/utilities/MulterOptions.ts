import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export function getFileType(file: Express.Multer.File): [fileType: string, extention: string] {
  return file.mimetype.split('/') as [fileType: string, extention: string];
}

export function customeDestinationForProductPhotos(
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, destination: string) => void,
) {
  const path = `public/products/photos`;
  cb(null, path);
}

export function customeFileNameForProductsPhotos(
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, destination: string) => void,
) {
  const [fileType, extension] = getFileType(file);
  // @ts-ignore
  const fileName = `${fileType}-${Date.now()}.${extension}`;
  file.filename = fileName;
  cb(null, file.filename);
}

export function customeFileFilterForProductPhotos(
  req: Request,
  file: Express.Multer.File,
  cb: any,
) {
  const [fileType] = getFileType(file);
  if (fileType === 'image') {
    cb(null, true);
  } else {
    cb(new BadRequestException('file must be image'), false);
  }
}
