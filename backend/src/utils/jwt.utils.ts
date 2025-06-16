import { JwtService } from '@nestjs/jwt';
import { Document } from 'mongoose';
import { Account } from '../modules/accounts/schemas/account.schema';
import { User } from '../modules/users/schemas/user.schema';

export const generateJwtToken = (jwtService: JwtService, account: Account, user?: Document & User) => {
  const payload = {
    sub: account._id,
    email: account.email,
    role: account.role,
    user: user?._id
  };

  return {
    access_token: jwtService.sign(payload),
    email: account.email,
    role: account.role,
    user: user ? {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    } : null,
  };
};