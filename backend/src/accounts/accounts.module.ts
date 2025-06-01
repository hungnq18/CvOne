import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controllers';
import { AccountsService } from './accounts.services';

@Module({
  imports: [],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
