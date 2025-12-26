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

  const access_token = jwtService.sign(payload);
  const refresh_token = jwtService.sign(
    { sub: account._id, email: account.email, type: "refresh" },
    { expiresIn: "7d" }
  );

  return {
    access_token,
    refresh_token,
    email: account.email,
    role: account.role,
    isActive: account.isActive,
  };
};
