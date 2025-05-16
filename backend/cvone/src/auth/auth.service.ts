import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user.entity';
import { OAuthUserDetail, LocalUserDetail } from 'src/utils/types';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async validateOAuthUser(details: OAuthUserDetail) {
    console.log('AuthService');
    console.log(details);
    const user = await this.userRepository.findOneBy({
      email: details.email,
    });
    console.log(user);

    if (user) return user;

    const newUser = this.userRepository.create({
      email: details.email,
      fullName: details.fullName, // map displayName thành fullName
      provider: 'google',
      googleId: details.googleId,
      avatar: details.avatar,
    });

    return this.userRepository.save(newUser);
  }

  async validateLocalUser(details: LocalUserDetail) {
    const user = await this.userRepository.findOneBy({ email: details.email });

    if (!user || !user.password) {
      return null; // hoặc throw UnauthorizedException
    }

    // So sánh password
    const isMatch = await this.comparePasswords(
      details.password,
      user.password,
    );
    if (!isMatch) return null;

    return user;
  }

  // Hàm hỗ trợ so sánh mật khẩu
  private async comparePasswords(
    inputPassword: string,
    storedHashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, storedHashedPassword);
  }

  async registerLocalUser(details: RegisterDto) {
    if (details.password !== details.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password do not match',
      );
    }

    const existing = await this.userRepository.findOneBy({
      email: details.email,
    });
    if (existing) throw new Error('User already exists');

    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(details.password, 10);

    const newUser = this.userRepository.create({
      email: details.email,
      password: hashed,
      provider: 'local',
    });

    return this.userRepository.save(newUser);
  }

  async findUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }
}
