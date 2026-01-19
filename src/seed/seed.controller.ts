import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';
// import { ValidRoles } from 'src/auth/interfaces/valid-roles';
// import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(ValidRoles.admin)
  runSeed() {
    return this.seedService.runSeed();
  }
}
