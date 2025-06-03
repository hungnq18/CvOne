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
import { CreateAccountDto } from './dto/create-account.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private mailService: MailService,
  ) {}

  async requestEmailVerification(verifyEmailDto: VerifyEmailDto) {
    const { email } = verifyEmailDto;

    // Check if account already exists
    const existingAccount = await this.accountModel.findOne({ email });
    if (existingAccount) {
      throw new ConflictException('Email already exists');
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Create temporary account with verification token
    const newAccount = new this.accountModel({
      email,
      emailVerificationToken: token,
      emailVerificationTokenExpires: expires,
    });

    await newAccount.save();

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

  async register(createAccountDto: CreateAccountDto): Promise<Account> {
    const { email, password } = createAccountDto;

    // Check if account exists and is verified
    const account = await this.accountModel.findOne({ email });
    if (!account || !account.isEmailVerified) {
      throw new ConflictException('Email not verified');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Update account with password
    account.password = hashedPassword;
    return account.save();
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.accountModel.findOne({ email }).exec();
  }
}
