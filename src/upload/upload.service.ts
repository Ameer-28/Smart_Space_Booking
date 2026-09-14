import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadService {
  formatResponse(file: Express.Multer.File, folder: string) {
    if (!file) throw new BadRequestException('File tidak ditemukan!');
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return {
      filename: file.filename,
      original_name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/${folder}/${file.filename}`,
    };
  }
}
