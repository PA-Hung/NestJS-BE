import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ReqUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @ResponseMessage('Create a new permission !')
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto, @ReqUser() userInfo: IUser) {
    return this.permissionsService.create(createPermissionDto, userInfo);
  }

  @Get()
  @ResponseMessage('Fetch all permission with pagination !')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  @ResponseMessage('Fetch permission by id !')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @ResponseMessage('Update a permission !')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @ReqUser() userInfo: IUser) {
    return this.permissionsService.update(id, updatePermissionDto, userInfo);
  }

  @Delete(':id')
  @ResponseMessage('Delete permission by id !')
  remove(@Param('id') id: string, @ReqUser() userInfo: IUser) {
    return this.permissionsService.remove(id, userInfo);
  }
}
