import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "../../common/decorators/roles.decorator";
import { AccountsService } from "../accounts/accounts.service";
import { CreateAccountDto } from "../accounts/dto/create-account.dto";
import { LoginDto } from "../accounts/dto/login.dto";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SocialLoginDto } from "./dto/social-login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Post("register") //register
  async register(@Body() createAccountDto: CreateAccountDto) {
    const account = await this.accountsService.register(createAccountDto);
    return {
      message:
        "Registration successful. Please verify your email to complete the registration.",
      email: account.email,
    };
  }

  @Post("login") //login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post("login/google")
  async loginGoogle(@Body() body: SocialLoginDto) {
    return this.authService.loginWithGoogle(body);
  }

  @Public()
  @Post("login/facebook")
  async loginFacebook(@Body() body: SocialLoginDto) {
    return this.authService.loginWithFacebook(body);
  }

  // Example of a protected route with role-based access
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post("admin-only")
  async adminRoute() {
    return { message: "This is an admin only route" };
  }

  /**
   * Request password reset
   * @param forgotPasswordDto - Contains user's email
   * @returns Success message
   * @public - No authentication required
   */
  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Change user's password
   * @param req - Request object containing user information
   * @param changePasswordDto - Contains current and new password
   * @returns Success message
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.account._id,
      changePasswordDto,
    );
  }

  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
