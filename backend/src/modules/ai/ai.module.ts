import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AiService],
  exports: [AiService], // Export so Grading/Course modules can use it
})
export class AiModule {}