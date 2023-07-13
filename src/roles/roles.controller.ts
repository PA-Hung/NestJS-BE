import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ReqUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @ResponseMessage('Create a new role !')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @ReqUser() userInfo: IUser) {
    return this.rolesService.create(createRoleDto, userInfo);
  }

  @Get()
  @ResponseMessage('Fetch all roles with pagination !')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string
  ) {
    return this.rolesService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  @ResponseMessage('Fetch role by id !')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a role !')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @ReqUser() userInfo: IUser) {
    return this.rolesService.update(id, updateRoleDto, userInfo);
  }

  @Delete(':id')
  @ResponseMessage('Delete role by id !')
  remove(@Param('id') id: string, @ReqUser() userInfo: IUser) {
    return this.rolesService.remove(id, userInfo);
  }
}
