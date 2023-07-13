import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { ReqUser, ResponseMessage } from 'src/decorator/customize';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage('Create a new resume !')
  create(@Body() createResumeDto: CreateResumeDto, @ReqUser() userInfo: IUser) {
    return this.resumesService.create(createResumeDto, userInfo);
  }

  @Get()
  @ResponseMessage('Fetch all resume with pagination !')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string
  ) {
    return this.resumesService.findAll(+currentPage, +limit, queryString);
  }

  @ResponseMessage('Fetch resume by id !')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage('Update status resume !')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto, @ReqUser() userInfo: IUser) {
    return this.resumesService.update(id, updateResumeDto, userInfo);
  }

  @ResponseMessage('Delete a resume by id !')
  @Delete(':id')
  remove(@Param('id') id: string, @ReqUser() userInfo: IUser) {
    return this.resumesService.remove(id, userInfo);
  }

  @Post('by-user')
  @ResponseMessage('Get resumes by user !')
  findByUser(@ReqUser() userInfo: IUser) {
    return this.resumesService.findByUser(userInfo);
  }
}
