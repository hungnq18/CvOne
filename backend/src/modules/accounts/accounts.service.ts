import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { hashPassword } from '../../utils/bcrypt.utils';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async register(createAccountDto: CreateAccountDto): Promise<Account> {
    const { email, password, name, phone, address } = createAccountDto;

    // Check if account already exists
    const existingAccount = await this.accountModel.findOne({ email });
    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new account
    const newAccount = new this.accountModel({
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    await newAccount.save();

    // Create user profile
    await this.usersService.create({
      name,
      email,
      phone,
      address,
      accountId: newAccount._id,
    });

    return newAccount;
  }

  async requestEmailVerification(verifyEmailDto: VerifyEmailDto) {
    const { email } = verifyEmailDto;

    // Find account
    const account = await this.accountModel.findOne({ email });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.isEmailVerified) {
      throw new ConflictException('Email already verified');
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Update account with verification token
    account.emailVerificationToken = token;
    account.emailVerificationTokenExpires = expires;
    await account.save();

    // Send verification email
    await this.mailService.sendVerificationEmail(email, token);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    const account = await this.accountModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() },
    });

    if (!account) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    account.isEmailVerified = true;
    account.emailVerificationToken = null;
    account.emailVerificationTokenExpires = null;
    await account.save();

    return { message: 'Email verified successfully' };
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.accountModel.findOne({ email }).exec();
  }
}
