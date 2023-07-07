import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])], // khai báo để dùng moongo
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule { }