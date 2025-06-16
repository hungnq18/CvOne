import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "../../common/decorators/roles.decorator";
import { comparePassword } from "../../utils/bcrypt.utils";
import { generateJwtToken } from "../../utils/jwt.utils";
import { AccountsService } from "../accounts/accounts.service";
import { CreateAccountDto } from "../accounts/dto/create-account.dto";
import { LoginDto } from "../accounts/dto/login.dto";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
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
    const { email, password } = loginDto;

    // Find account
    const account = await this.accountsService.findByEmail(email);
    if (!account) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if email is verified
    if (!account.isEmailVerified) {
      throw new UnauthorizedException(
        "Please verify your email before logging in"
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return generateJwtToken(this.jwtService, account);
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
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }
}
