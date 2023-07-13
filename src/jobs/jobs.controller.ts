import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ReqUser, ResponseMessage } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @ResponseMessage('Create a new job !')
  @Post()
  create(@Body() createJobDto: CreateJobDto, @ReqUser() userInfo: IUser) {
    return this.jobsService.create(createJobDto, userInfo);
  }

  @Get()
  @Public()
  @ResponseMessage('Fetch list jobs with paginate !')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string
  ) {
    return this.jobsService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Fetch a job by id ')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a job !')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @ReqUser() userInfo: IUser
  ) {
    return this.jobsService.update(id, updateJobDto, userInfo);
  }

  @Delete(':id')
  @ResponseMessage('Delete a job !')
  remove(
    @Param('id') id: string,
    @ReqUser() userInfo: IUser
  ) {
    return this.jobsService.remove(id, userInfo);
  }
}
