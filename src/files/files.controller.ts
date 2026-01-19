import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import express from 'express';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadDto } from './dto/files-upload.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImages(
    @Res() res: express.Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    console.log(path);
    res.sendFile(path);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      //? se puede usar el fileFilter directamente aqui o importandolo de otro archivo
      // fileFilter: (req, file, cb) => {
      //   if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      //     return cb(new Error('Only image files are allowed!'), false);
      //   }
      //   cb(null, true);
      // },
      fileFilter: fileFilter,
      // limits: { fileSize: 1024 * 1024 * 5  // 5MB},
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: FileUploadDto,
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log({ file });

    if (!file) {
      throw new BadRequestException('File not provided or invalid file type');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl };
  }

  //   @Post('upload2')
  //   @UseInterceptors(FileInterceptor('file'))
  //   uploadFile1(
  //     @UploadedFile(
  //       new ParseFilePipeBuilder()
  //         .addFileTypeValidator({
  //           fileType: /\/(jpg|jpeg|png)$/,
  //           // skipMagicNumbersValidation: true,
  //         })
  //         .build({
  //           // errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //           fileIsRequired: true,
  //         }),
  //     )
  //     file: Express.Multer.File,
  //   ) {
  //     console.log({ file });

  //     if (!file) {
  //       throw new BadRequestException('File not provided or invalid file type');
  //     }

  //     return file.originalname;
  //   }
}
