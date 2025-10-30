import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as crypto from "crypto";
import { Model } from "mongoose";
import { hashPassword } from "../../utils/bcrypt.utils";
import { MailService } from "../mail/mail.service";
import { UsersService } from "../users/users.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { RequestResetCodeDto } from "./dto/request-reset-code.dto";
import { VerifyResetCodeDto } from "./dto/verify-reset-code.dto";
import { Account, AccountDocument } from "./schemas/account.schema";
import { PasswordResetCodeService } from "./password-reset-code.service";
import { CreateAccountHRDto } from "./dto/create-account-hr.dto";
// ...existing code...
@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private mailService: MailService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService, // Sửa ở đây
    private passwordResetCodeService: PasswordResetCodeService,
  ) { }

  async register(createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      const { first_name, last_name, email, password, city, phone, country } =
        createAccountDto;

      this.logger.debug(
        `Received registration data: ${JSON.stringify({ email, first_name, last_name })}`,
      );

      if (!email || email.trim() === "") {
        throw new ConflictException("Email is required");
      }

      const trimmedEmail = email.trim();
      this.logger.debug(`Processing registration for email: ${trimmedEmail}`);

      // Check if account already exists
      const existingAccount = await this.accountModel.findOne({
        email: trimmedEmail,
      });
      if (existingAccount) {
        throw new ConflictException("Email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new account
      const newAccount = new this.accountModel({
        email: trimmedEmail,
        password: hashedPassword,
        isEmailVerified: false,
        role: "user",
      });

      this.logger.debug("Saving new account...");
      const savedAccount = await newAccount.save();
      this.logger.debug(
        `Account saved successfully with email: ${savedAccount.email}`,
      );

      try {
        // Create user profile
        const userProfile = await this.usersService.createUser({
          first_name,
          last_name,
          phone: phone ?? "",
          city: city ?? "",
          country: country ?? "",
          account_id: savedAccount._id,
        });
        this.logger.debug(
          `User profile ${userProfile ? "created" : "retrieved"} successfully`,
        );

        // Send verification email
        try {
          const verificationToken = crypto.randomBytes(32).toString("hex");
          const tokenExpires = new Date();
          tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hours

          // Save token to account
          savedAccount.emailVerificationToken = verificationToken;
          savedAccount.emailVerificationTokenExpires = tokenExpires;
          await savedAccount.save();

          // Send verification email
          await this.mailService.sendVerificationEmail(
            trimmedEmail,
            verificationToken,
          );
          this.logger.debug(`Verification email sent to ${trimmedEmail}`);
        } catch (mailError) {
          this.logger.error(
            `Failed to send verification email: ${mailError.message}`,
          );
          // Don't throw error here, just log it - user can still register
        }
      } catch (error) {
        // If user creation fails, delete the account
        this.logger.error(
          "Failed to create user profile, rolling back account creation",
        );
        await this.accountModel.findByIdAndDelete(savedAccount._id);
        throw error;
      }

      return savedAccount;
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Registration failed: ${error.message}`,
      );
    }
  }

  async registerByAdmin(createAccountDto: CreateAccountDto): Promise<Account> {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      city,
      phone,
      country,
    } = createAccountDto;

    const existingAccount = await this.accountModel.findOne({
      email: email.trim(),
    });
    if (existingAccount) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newAccount = new this.accountModel({
      email: email.trim(),
      password: hashedPassword,
      isEmailVerified: true, // Directly verify the email
      role: role || "user", // Use provided role or default to 'user'
    });

    const savedAccount = await newAccount.save();

    try {
      await this.usersService.createUser({
        first_name,
        last_name,
        phone: phone ?? "",
        city: city ?? "",
        country: country ?? "",
        account_id: savedAccount._id,
      });
    } catch (error) {
      await this.accountModel.findByIdAndDelete(savedAccount._id);
      throw error;
    }

    return savedAccount;
  }

  async registerHR(dto: CreateAccountHRDto): Promise<Account> {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        phone,
        city,
        country,
        company_name,
        company_country,
        company_city,
        company_district,
        vatRegistrationNumber,
      } = dto;

      if (!email || email.trim() === "") {
        throw new ConflictException("Email is required");
      }

      const trimmedEmail = email.trim();

      // Check existing account
      const existingAccount = await this.accountModel.findOne({
        email: trimmedEmail,
      });
      if (existingAccount) {
        throw new ConflictException("Email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create HR account with role = hr
      const newAccount = new this.accountModel({
        email: trimmedEmail,
        password: hashedPassword,
        isEmailVerified: false,
        role: "hr",
      });

      const savedAccount = await newAccount.save();

      try {
        // Create base user profile
        const createdUser = await this.usersService.createUser({
          first_name,
          last_name,
          phone: phone ?? "",
          city: city ?? "",
          country: country ?? "",
          account_id: savedAccount._id,
        });

        // Update HR-specific fields
        await this.usersService.updateHRFields(createdUser._id.toString(), {
          company_name,
          company_country,
          company_city,
          company_district,
          vatRegistrationNumber,
        });

        // Send verification email (same flow as user register)
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);
        savedAccount.emailVerificationToken = verificationToken;
        savedAccount.emailVerificationTokenExpires = tokenExpires;
        await savedAccount.save();
        await this.mailService.sendVerificationEmail(
          trimmedEmail,
          verificationToken,
        );
      } catch (error: any) {
        await this.accountModel.findByIdAndDelete(savedAccount._id);
        throw error;
      }

      return savedAccount;
    } catch (error: any) {
      this.logger.error(`HR Registration error: ${String(error)}`);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `HR registration failed: ${String(error)}`,
      );
    }
  }

  async requestEmailVerification(verifyEmailDto: VerifyEmailDto) {
    const { email } = verifyEmailDto;

    // Find account
    const account = await this.accountModel.findOne({ email });
    if (!account) {
      throw new NotFoundException("Account not found");
    }

    if (account.isEmailVerified) {
      throw new ConflictException("Email already verified");
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Update account with verification token
    account.emailVerificationToken = token;
    account.emailVerificationTokenExpires = expires;
    await account.save();

    // Send verification email
    await this.mailService.sendVerificationEmail(email, token);

    return { message: "Verification email sent" };
  }

  async verifyEmail(token: string) {
    console.log("Verifying email with token:", token);

    // Tìm account với token
    const account = await this.accountModel.findOne({
      emailVerificationToken: token,
    });

    console.log(
      "Found account:",
      account
        ? {
          id: account._id,
          email: account.email,
          isVerified: account.isEmailVerified,
          tokenExpires: account.emailVerificationTokenExpires,
        }
        : "no account found",
    );

    // Nếu không tìm thấy account hoặc token không khớp
    if (!account) {
      console.log("No account found with this token");
      return {
        success: false,
        message: "Invalid verification token",
      };
    }

    // Kiểm tra token hết hạn
    if (
      !account.emailVerificationTokenExpires ||
      account.emailVerificationTokenExpires < new Date()
    ) {
      console.log("Token is expired:", {
        tokenExpires: account.emailVerificationTokenExpires,
        currentTime: new Date(),
      });
      return {
        success: false,
        message: "Verification token has expired",
      };
    }

    // Update trạng thái verify và xóa token
    account.isEmailVerified = true;
    account.emailVerificationToken = null;
    account.emailVerificationTokenExpires = null;
    await account.save();

    console.log("Account verified successfully:", {
      id: account._id,
      email: account.email,
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.accountModel.findOne({ email }).exec();
  }

  async updateRole(accountId: string, role: string): Promise<Account> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException("Account not found");
    }

    const allowedRoles = ["admin", "user", "hr"];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException("Invalid role specified");
    }

    account.role = role;
    return account.save();
  }

  async deleteAccount(accountId: string): Promise<{ deleted: boolean }> {
    const result = await this.accountModel.findByIdAndDelete(accountId).exec();
    if (!result) {
      throw new NotFoundException("Account not found");
    }
    return { deleted: true };
  }

  // Code-based reset flow without schema changes
  async requestPasswordResetCode(dto: RequestResetCodeDto) {
    const email = dto.email.trim();

    // Check if there's already an active code
    const existing = this.passwordResetCodeService.hasActiveCode(email);
    if (existing) {
      throw new BadRequestException("Reset code already sent, please wait.");
    }

    // Check if account exists (but don't reveal this information)
    const account = await this.accountModel.findOne({ email });
    if (!account) {
      // Always return success message to prevent email enumeration
      return {
        message: "If the email exists, a password reset code has been sent",
      };
    }

    const code = this.passwordResetCodeService.generateAndStore(email);
    await this.mailService.sendPasswordResetCodeEmail(email, code);
    return {
      message: "If the email exists, a password reset code has been sent",
    };
  }

  async resetPasswordWithCode(dto: VerifyResetCodeDto) {
    const email = dto.email.trim();
    const ok = this.passwordResetCodeService.validate(email, dto.code);
    if (!ok) {
      throw new BadRequestException("Invalid or expired code");
    }

    const account = await this.accountModel.findOne({ email });
    if (!account) {
      throw new NotFoundException("Account not found");
    }

    const hashed = await hashPassword(dto.newPassword);
    account.password = hashed;
    await account.save();
    return { message: "Password has been reset successfully" };
  }
}
