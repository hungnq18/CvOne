import { JwtService } from "@nestjs/jwt";
import { Account } from "../modules/accounts/schemas/account.schema";

export const generateJwtToken = (jwtService: JwtService, account: Account) => {
  const payload = {
    sub: account._id,
    email: account.email,
    role: account.role,
  };

  return {
    access_token: jwtService.sign(payload),
    email: account.email,
    role: account.role,
  };
};
