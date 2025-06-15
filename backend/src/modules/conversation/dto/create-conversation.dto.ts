import { IsArray, ArrayMinSize, IsMongoId } from "class-validator";

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsMongoId({ each: true })
  participants: string[]; // bao gồm 2 userId
}
