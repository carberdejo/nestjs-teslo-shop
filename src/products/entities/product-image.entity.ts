import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'product_images' })
export class ProductImage {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the product image',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'http://example.com/images/product-image.jpg',
    description: 'URL of the product image',
  })
  @Column('text')
  url: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
