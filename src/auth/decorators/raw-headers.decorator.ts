import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RowHeaders = createParamDecorator(
  (data, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const headers = req.headers;
    return headers;
  },
);
