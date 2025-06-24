// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user?.user;

    if (!user) {
      // This will be caught by NestJS and result in a 401 Unauthorized response
      // if the user object or nested user property doesn't exist.
      // This can happen if the JWT is valid but there's no corresponding user in the DB.
      throw new UnauthorizedException('User not found from token');
    }
    
    return data ? user?.[data] : user;
  },
);
