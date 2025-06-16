import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { Conversation } from "../chat/schemas/conversation.schema";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly convModel: Model<Conversation>
  ) {}

  async createConversation(dto: CreateConversationDto) {
    const userIds = dto.participants.map((id) => new Types.ObjectId(id));

    // Kiểm tra xem đã tồn tại cuộc trò chuyện giữa 2 người này chưa
    const existing = await this.convModel.findOne({
      participants: { $all: userIds, $size: 2 },
    });

    if (existing) {
      return existing; // hoặc throw new ConflictException('Conversation already exists');
    }

    const conversation = new this.convModel({ participants: userIds });
    return conversation.save();
  }

  async getUserConversations(userId: string) {
    return this.convModel
      .find({
        participants: new Types.ObjectId(userId),
      })
      .sort({ updatedAt: -1 })
      .populate({
        path: "lastMessage",
        select: "content senderId createdAt",
      });
  }
}
