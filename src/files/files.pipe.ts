import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-outlook',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
  ];

  transform(files: Express.Multer.File | Express.Multer.File[]) {
    if (Array.isArray(files)) {
      const invalidFiles = files.filter(
        file => !this.allowedMimeTypes.includes(file.mimetype)
      );

      if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map(file => file.originalname).join(', ');
        throw new BadRequestException(
          `Invalid file type(s): ${invalidFileNames}. Only PDFs, DOCX, MSG, and image files are allowed.`
        );
      }
      return files;
    } else if (files && !this.allowedMimeTypes.includes(files.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${files.originalname}. Only PDFs, DOCX, MSG, and image files are allowed.`
      );
    }
    return files;
  }
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly MAX_FILE_SIZE = 25 * 1024 * 1024;
  transform(files: Express.Multer.File | Express.Multer.File[]) {
    if (Array.isArray(files)) {
      const oversizedFiles = files.filter(file => file.size > this.MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        const oversizedFileNames = oversizedFiles.map(file => 
          `${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
        ).join(', ');
        
        throw new BadRequestException(
          `File size exceeded. Maximum allowed size is 25MB per file. Oversized files: ${oversizedFileNames}`
        );
      }
      return files;
    } else if (files && files.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeded for ${files.originalname}. Maximum allowed size is 25MB per file, got ${(files.size / (1024 * 1024)).toFixed(2)}MB`
      );
    }
    return files;
  }
}