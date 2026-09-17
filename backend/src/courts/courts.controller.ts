import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { Court } from '../types';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  findAll(@Query('venueId') venueId?: string, @Query('venue_id') venue_id?: string): Court[] {
    return this.courtsService.findAll(venueId || venue_id);
  }

  @Post()
  create(@Body() data: Partial<Court>): Court {
    return this.courtsService.create(data);
  }
}
