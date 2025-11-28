import { IsString, IsNotEmpty, IsMongoId } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
