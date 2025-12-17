import { JwtService } from "@nestjs/jwt";
import { Account } from "../modules/accounts/schemas/account.schema";
import { User } from "src/modules/users/schemas/user.schema";

export const generateJwtToken = (
  jwtService: JwtService,
  account: Account,
  user?: User | null,
) => {
  const payload = {
    sub: account._id,
    email: account.email,
    role: account.role,
    user: user?._id || null,
    isActive: account.isActive,
  };

  return {
    access_token: jwtService.sign(payload),
    email: account.email,
    role: account.role,
  };
};
