import { Controller, Get, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  findAll() { return this.supportService.findAll(); }

  @Post('tickets')
  create(@Body() data: any) { return this.supportService.create(data); }
}
