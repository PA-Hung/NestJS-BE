import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {

  constructor(@InjectModel(Job.name)
  private jobModel: SoftDeleteModel<JobDocument>) { }

  async create(createJobDto: CreateJobDto, userInfo: IUser) {
    let jobData = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
    return {
      "_id": jobData._id,
      "createdAt": jobData.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, projection, sort, population } = aqp(queryString);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    // if (isEmpty(sort)) {
    //   // @ts-ignore: Unreachable code error
    //   sort = "-updatedAt"
    // }
    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found job !'
    }
    return await this.jobModel.findById(id)
  }

  async update(id: string, updateJobDto: UpdateJobDto, userInfo: IUser) {
    return await this.jobModel.updateOne({ _id: id }, {
      ...updateJobDto,
      updatedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    });
  }

  async remove(id: string, userInfo: IUser) {
    await this.jobModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    });
    return this.jobModel.softDelete({ _id: id })
  }

}
