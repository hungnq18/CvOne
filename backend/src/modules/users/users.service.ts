import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { AccountsService } from '../accounts/accounts.service';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private accountsService: AccountsService,
  ) {}

  async createUser(user: User): Promise<User> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByAccountId(accountId: string): Promise<User> {
    const user = await this.userModel.findOne({ account_id: accountId }).exec();
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
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}

