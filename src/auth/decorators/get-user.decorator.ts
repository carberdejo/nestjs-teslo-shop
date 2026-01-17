import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found in request');
    }

    return data ? user[data] : user;
  },
);
