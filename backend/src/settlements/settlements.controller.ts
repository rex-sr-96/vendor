import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { SettlementRecord } from '../types';

@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get()
  findAll(): SettlementRecord[] {
    return this.settlementsService.findAll();
  }

  @Post('instant')
  requestInstant(@Body() data: { amount?: number }): SettlementRecord {
    return this.settlementsService.requestInstant(data.amount);
  }
}
