import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll() { return this.staffService.findAll(); }

  @Post()
  create(@Body() data: any) { return this.staffService.create(data); }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) { return this.staffService.toggleStatus(id); }

  @Patch(':id/permissions')
  updatePermissions(@Param('id') id: string, @Body() data: { permKey: string }) {
    return this.staffService.updatePermissions(id, data.permKey);
  }
}
