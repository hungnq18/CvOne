import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
import { generateJwtToken } from "../../utils/jwt.utils";
import { LoginDto } from "../accounts/dto/login.dto";
import { Account } from "../accounts/schemas/account.schema";
import { MailService } from "../mail/mail.service";
import { User } from "../users/schemas/user.schema";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /**
   * Login user and return JWT token
   * @param loginDto - Contains email and password
   */
  async login(loginDto: LoginDto) {
    const account = await this.accountModel.findOne({ email: loginDto.email });
    if (!account) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      account.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if email is verified
    if (!account.isEmailVerified) {
      throw new UnauthorizedException("Email not verified. Please check your email and verify your account before logging in.");
    }

    const user = await this.userModel.findOne({ account_id: account._id });

    return generateJwtToken(this.jwtService, account, user);
  }

  /**
   * Send password reset email
   * @param forgotPasswordDto - Contains user's email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const account = await this.accountModel.findOne({
      email: forgotPasswordDto.email,
    });
    if (!account) {
      throw new BadRequestException("Email not found");
    }

    // Generate reset token with userId
    const resetToken = this.jwtService.sign(
      {
        sub: account._id,
        email: account.email,
      },
      { expiresIn: "1h" },
    );

    // Send reset email using existing mail service
    await this.mailService.sendPasswordResetEmail(account.email, resetToken);

    return { message: "Password reset email sent" };
  }

  /**
   * Change user's password
   * @param userId - User's ID
   * @param changePasswordDto - Contains current and new password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const account = await this.accountModel.findById(userId);
    if (!account) {
      throw new BadRequestException("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      account.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    return { message: "Password changed successfully" };
  }

  /**
   * Reset user's password using token
   * @param resetPasswordDto - Contains token and new password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetPasswordDto.token);
    } catch (e) {
      throw new BadRequestException("Invalid or expired token");
    }

    const account = await this.accountModel.findById(payload.sub);
    if (!account) {
      throw new BadRequestException("User not found");
    }

    account.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await account.save();

    return { message: "Password reset successfully" };
  }
}
