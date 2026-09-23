import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';

const imageFileFilter = (req: any, file: any, cb: any) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return cb(new BadRequestException('Hanya file gambar yang diperbolehkan (.jpg, .jpeg, .png, .webp)!'), false);
  }
  cb(null, true);
};

const createStorage = (folder: string) =>
  diskStorage({
    destination: join(process.cwd(), 'uploads', folder),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  });

@ApiTags('Upload Media')
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('general'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload Berkas Gambar Umum (Multipart Form Data)' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const data = this.uploadService.formatResponse(file, 'general');
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'File berhasil diupload',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('spaces')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('spaces'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload Foto Ruangan / Space Coworking' })
  @ApiConsumes('multipart/form-data')
  async uploadSpace(@UploadedFile() file: Express.Multer.File) {
    const data = this.uploadService.formatResponse(file, 'spaces');
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Foto space berhasil diupload',
      data: { filename: data.filename, url: data.url },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('members')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('members'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload Foto Profil Member / Pelanggan' })
  @ApiConsumes('multipart/form-data')
  async uploadMember(@UploadedFile() file: Express.Multer.File) {
    const data = this.uploadService.formatResponse(file, 'members');
    return {
      status: true,
      statusCode: HttpStatus.CREATED,
      message: 'Foto member berhasil diupload',
      data: { filename: data.filename, url: data.url },
      timestamp: new Date().toISOString(),
    };
  }
}
