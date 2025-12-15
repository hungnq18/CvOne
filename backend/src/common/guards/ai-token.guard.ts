import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AI_FEATURE_KEY } from "../decorators/ai-feature.decorator";
import { AiFeature } from "../../modules/ai-usage-log/schemas/ai-usage-log.schema";
import { CreditsService } from "../../modules/credits/credits.service";
import { AI_FEATURE_META } from "../../modules/ai-usage-log/ai-feature.meta";

@Injectable()
export class AiTokenGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private creditService: CreditsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<AiFeature>(
      AI_FEATURE_KEY,
      context.getHandler()
    );

    // Route không dùng AI → cho qua
    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user.user._id;

    const featureMeta = AI_FEATURE_META[feature];

    if (!featureMeta) {
      throw new BadRequestException("AI feature is not configured");
    }

    const requiredToken = featureMeta.avgTokens;

    const hasEnough = await this.creditService.hasEnoughToken(
      userId,
      requiredToken
    );

    if (!hasEnough) {
      throw new BadRequestException(
        `Not enough tokens. Required: ${requiredToken}`
      );
    }

    // truyền xuống cho interceptor dùng lại
    request.aiFeature = feature;
    request.estimatedToken = requiredToken;

    return true;
  }
}
