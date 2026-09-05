import { Controller, Get, Post, Body } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { Court } from '../types';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  findAll(): Court[] {
    return this.courtsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Court>): Court {
    return this.courtsService.create(data);
  }
}
