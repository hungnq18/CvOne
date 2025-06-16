import { JwtService } from "@nestjs/jwt";
import { Account } from "../modules/accounts/schemas/account.schema";

export const generateJwtToken = (
  jwtService: JwtService,
  account: Account,
  user?: Document & User
) => {
  const payload = {
    sub: account._id,
    email: account.email,
    role: account.role,
    user: user?._id,
  };

  return {
    access_token: jwtService.sign(payload),
    email: account.email,
    role: account.role,
  };
};
