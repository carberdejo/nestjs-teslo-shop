import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    //? esto es para obtener la ruta absoluta de la imagen
    //? ejemplo: D:\CURSOS\Nest\04-teslo-shop\static\products\nombre-de-la-imagen.jpg
    const path = join(__dirname, '../../static/products', imageName);

    //? verificar si la imagen existe en la ruta
    if (!existsSync(path)) {
      throw new BadRequestException('No product image found ' + imageName);
    }

    return path;
  }
}
