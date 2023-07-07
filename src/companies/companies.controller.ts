import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { IUser } from 'src/users/users.interface';
import { ReqUser, ResponseMessage } from 'src/decorator/customize';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @ReqUser() userInfo: IUser) {
    return this.companiesService.create(createCompanyDto, userInfo);
  }

  @Get()
  @ResponseMessage('Fetch list company with paginate !')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string
  ) {
    return this.companiesService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  // truyền id theo kiểu param (id trên đường dẫn url)
  @Patch()
  @ResponseMessage('Update a company !')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @ReqUser() userInfo: IUser
  ) {
    return this.companiesService.update(id, updateCompanyDto, userInfo);
  }

  @Delete(':id')
  @ResponseMessage('Delete a company !')
  remove(
    @Param('id') id: string,
    @ReqUser() userInfo: IUser
  ) {
    return this.companiesService.remove(id, userInfo);
  }
}
