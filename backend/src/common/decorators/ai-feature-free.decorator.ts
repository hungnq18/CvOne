import { SetMetadata } from "@nestjs/common";

export const FREE_AI_KEY = "FREE_AI";
export const FreeAi = () => SetMetadata(FREE_AI_KEY, true);
