import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    example: 'b1a8f5e2-3c4d-4e5f-8a9b-0c1d2e3f4g5h',
    description: 'User unique identifier',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    uniqueItems: true,
  })
  @Column('varchar', { unique: true })
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password',
  })
  @Column('varchar', { select: false })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @Column('varchar')
  fullName: string;

  @ApiProperty({
    example: true,
    description: 'Is the user account active?',
  })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['user', 'admin'],
    description: 'Roles assigned to the user',
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  product: Product[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    this.email = this.email.toLowerCase().trim();
  }
}
