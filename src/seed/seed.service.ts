import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.InserNewProducts2();

    return `RUUN SEED`;
  }

  private async InserNewProducts() {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    for (const product of seedProducts) {
      await this.productsService.create(product);
    }
    return true;
  }

  private async InserNewProducts2() {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises: Promise<any>[] = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });
    await Promise.all(insertPromises);

    return true;
  }
}
