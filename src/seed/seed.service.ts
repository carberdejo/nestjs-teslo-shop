import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const user = await this.InserNewUsers();
    await this.InserNewProducts2(user);

    return `RUUN SEED`;
  }

  //? demora más porque espera a que cada inserción termine antes de iniciar la siguiente
  private async InserNewProducts(user: User) {
    const seedProducts = initialData.products;

    for (const product of seedProducts) {
      await this.productsService.create(product, user);
    }
    return true;
  }

  private async InserNewProducts2(user: User) {
    const seedProducts = initialData.products;

    const insertPromises: Promise<any>[] = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });
    await Promise.all(insertPromises);

    return true;
  }

  async InserNewUsers() {
    const seedUsers = initialData.users;
    const user: User[] = [];
    seedUsers.forEach((seedUser) => {
      const { password, ...userData } = seedUser;
      user.push(
        this.userRepository.create({
          ...userData,
          password: bcrypt.hashSync(password, 10),
        }),
      );
    });

    await this.userRepository.save(user);
    return user[0];
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }
}
