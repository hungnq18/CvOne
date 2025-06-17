import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Account } from "../../accounts/schemas/account.schema";
import { User } from "../../users/schemas/user.schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    try {
      const account = await this.accountModel.findById(payload.sub);
      if (!account) {
        throw new UnauthorizedException("Account not found");
      }
      const user = await this.userModel.findOne({ account_id: account._id });

      return {
        account: {
          _id: account._id,
          email: account.email,
          role: account.role,
        },
        user: user
          ? {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
            }
          : null,
      };
    } catch (error) {
      console.error("JWT validation error:", error); // Debug log
      throw new UnauthorizedException("Invalid token");
    }
  }
}
