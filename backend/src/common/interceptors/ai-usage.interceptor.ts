import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { tap } from "rxjs";
import { AiUsageLogService } from "src/modules/ai-usage-log/ai-usage-log.service";
import {
  AiFeature,
  AiUsageLog,
  AiUsageLogDocument,
} from "src/modules/ai-usage-log/schemas/ai-usage-log.schema";
import { CreditsService } from "src/modules/credits/credits.service";
import { AI_FEATURE_KEY } from "../decorators/ai-feature.decorator";
import { Reflector } from "@nestjs/core";
import { FREE_AI_KEY } from "../decorators/ai-feature-free.decorator";

@Injectable()
export class AiUsageInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private creditService: CreditsService,
    private readonly aiUsageService: AiUsageLogService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.user._id;

    const feature = this.reflector.get<AiFeature>(
      AI_FEATURE_KEY,
      context.getHandler()
    );
    const isFreeAi = this.reflector.get<boolean>(
      FREE_AI_KEY,
      context.getHandler()
    );

    return next.handle().pipe(
      tap(async (aiResult) => {
        if (!aiResult?.total_tokens || !feature) return;

        if (!isFreeAi) {
          await this.creditService.useToken(userId, aiResult.total_tokens);
        }
        await this.aiUsageService.createLog({
          userId,
          feature,
          tokensUsed: aiResult.total_tokens,
        });
      })
    );
  }
}
