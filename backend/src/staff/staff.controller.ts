import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  findAll(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ) {
    return this.staffService.findAll({ role, status, query });
  }

  @Post()
  create(@Body() data: any) {
    return this.staffService.create(data);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.staffService.toggleStatus(id);
  }

  @Patch(':id/permissions')
  updatePermissions(@Param('id') id: string, @Body() data: { permKey: string }) {
    return this.staffService.updatePermissions(id, data.permKey);
  }

  @Delete(':id')
  deleteStaff(@Param('id') id: string) {
    return this.staffService.deleteStaff(id);
  }
}

