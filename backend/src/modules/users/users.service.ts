import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { AccountsService } from "../accounts/accounts.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private accountsService: AccountsService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = await this.userModel.create(createUserDto);
      return createdUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel
      .find()
      .populate({
        path: "account_id",
        select: "email role",
      })
      .exec();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate({
        path: "account_id",
        select:
          "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires",
      })
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async getUserByAccountId(
    accountId: string | Types.ObjectId,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ account_id: accountId })
      .populate({
        path: "account_id",
        select:
          "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires",
      })
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
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
        path: "account_id",
        select:
          "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires",
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async deleteUser(userId: string): Promise<{ deleted: boolean }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const accountId = user.account_id;

    // Delete the user
    const userDeletionResult = await this.userModel
      .deleteOne({ _id: userId })
      .exec();
    if (userDeletionResult.deletedCount === 0) {
      throw new NotFoundException("User could not be deleted");
    }

    // Delete the associated account
    await this.accountsService.deleteAccount(accountId.toString());

    return { deleted: true };
  }

  async findByAccountId(accountId: string): Promise<User | null> {
    return this.userModel.findOne({ account_id: accountId }).exec();
  }
}
