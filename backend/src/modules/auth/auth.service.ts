import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { LoginDto, RegisterDto, VerifyEmailDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private verificationCodes: Map<string, { code: string; timestamp: number }> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
        isEmailVerified: true, // Set to true after email verification
      },
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async sendVerificationEmail(email: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with timestamp (expires in 10 minutes)
    this.verificationCodes.set(email, {
      code,
      timestamp: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(email, code);

    return { message: 'Verification code sent to your email' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;

    const storedData = this.verificationCodes.get(email);
    if (!storedData) {
      throw new BadRequestException('No verification code found for this email');
    }

    if (Date.now() > storedData.timestamp) {
      this.verificationCodes.delete(email);
      throw new BadRequestException('Verification code has expired');
    }

    if (storedData.code !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Remove the used code
    this.verificationCodes.delete(email);

    return { message: 'Email verified successfully' };
  }
} 