import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private accountsService: AccountsService,
  ) {}

  async createUser(user: User): Promise<User> {
    try {
      this.logger.debug(`Creating user profile with data: ${JSON.stringify({
        account_id: user.account_id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
      })}`);

      // Check if user profile already exists for this account
      const existingUser = await this.userModel.findOne({ account_id: user.account_id });
      if (existingUser) {
        this.logger.debug(`User profile already exists for account: ${user.account_id}`);
        return existingUser;
      }

      // Validate required fields
      if (!user.account_id) {
        throw new InternalServerErrorException('Account ID is required');
      }
      if (!user.first_name) {
        throw new InternalServerErrorException('First name is required');
      }
      if (!user.last_name) {
        throw new InternalServerErrorException('Last name is required');
      }

      const newUser = new this.userModel({
        account_id: user.account_id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        city: user.city || '',
        country: user.country || ''
      });

      this.logger.debug('Attempting to save user...');
      const savedUser = await newUser.save();
      this.logger.debug(`User profile created successfully with ID: ${savedUser._id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user profile: ${error.message}`, error.stack);
      if (error.code === 11000) {
        this.logger.error('Duplicate key error:', error.keyValue);
        // If we get here, it means the profile was created between our check and save
        const existingUser = await this.userModel.findOne({ account_id: user.account_id });
        if (existingUser) {
          return existingUser;
        }
      }
      throw new InternalServerErrorException(`Failed to create user profile: ${error.message}`);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate({
        path: 'account_id',
        select:
          '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByAccountId(accountId: string): Promise<User> {
    const user = await this.userModel
      .findOne({ account_id: accountId })
      .populate({
        path: 'account_id',
        select:
          '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            ...(updateUserDto.first_name && {
              first_name: updateUserDto.first_name,
            }),
            ...(updateUserDto.last_name && {
              last_name: updateUserDto.last_name,
            }),
            ...(updateUserDto.phone && { phone: updateUserDto.phone }),
            ...(updateUserDto.city && { city: updateUserDto.city }),
            ...(updateUserDto.country && { country: updateUserDto.country }),
          },
        },
        { new: true },
      )
      .populate({
        path: 'account_id',
        select:
          '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires',
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
