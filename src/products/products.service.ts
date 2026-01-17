import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      //? al crear un imageproduct no se guarda en la base de datos hasta que se guarde el producto que las contiene y al estar dentro del create del producto se guardan en cascada y el productid se asigna del producto padre
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user: user,
      });

      await this.productRepository.save(product);

      return { ...product, images: images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    console.log(paginationDto);
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      order: { tittle: 'ASC' },
      take: limit,
      skip: offset,
      //TODO:Relaciones
      relations: { images: true }, //JOIN EAGER
    });

    return products.map((product) => ({
      ...product,
      images: (product.images ?? []).map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product | null = null;

    if (isUUID(term)) {
      console.log('buscando por id');
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({ slug: term,tittle: term });

      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder
        .where('UPPER(prod.tittle) =:tittle or prod.slug LIKE :slug', {
          tittle: term.toUpperCase(),
          slug: `%${term}%`,
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }
    return {
      ...product,
      images: product.images?.map((img) => img.url) || [],
    };
  }

  // async  findOnePlain  (term: string) => {
  //   const product = await this.findOne(term);
  //   return {
  //     ...product,
  //     images: product.images?.map((img) => img.url) || [],
  //   };
  // }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    //? Preload crea una nueva entidad con los datos que le pasamos y si encuentra el id lo actualiza, si no lo encuentra devuelve null
    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images?.length) {
        //? eliminar las imagenes anteriores
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        //? asignar las nuevas imagenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

    // try {
    //   const result = await this.productRepository
    //     .createQueryBuilder()
    //     .update({
    //       id: id,
    //       ...updateProductDto,
    //     })
    //     .where({ id })
    //     .execute();

    //   return result;
    // } catch (error) {
    //   this.handleDBExceptions(error);
    // }
  }

  async remove(id: string) {
    const deleted = await this.productRepository.delete(id);
    if (deleted.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return {
      ok: true,
      message: `Product with id ${id} deleted successfully`,
    };
  }

  private handleDBExceptions(error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
