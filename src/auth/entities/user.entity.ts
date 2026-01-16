import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { select: false })
  password: string;

  @Column('varchar')
  fullName: string;

  @Column('boolean', { default: true })
  isAcive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];
}
