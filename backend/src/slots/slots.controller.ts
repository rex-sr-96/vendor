import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { Slot } from '../types';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  findAll(): Slot[] {
    return this.slotsService.findAll();
  }

  @Post('block')
  blockSlot(@Body() data: { courtId: string; courtName: string; time: string; reason: string; type: string; notes?: string }): Slot {
    return this.slotsService.blockSlot(data);
  }

  @Patch(':id/unblock')
  unblockSlot(@Param('id') id: string): Slot | undefined {
    return this.slotsService.unblockSlot(id);
  }
}
