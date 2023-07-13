import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {

  constructor(@InjectModel(Resume.name)
  private resumeModel: SoftDeleteModel<ResumeDocument>) { }

  async create(createResumeDto: CreateResumeDto, userInfo: IUser) {
    const resumeData = await this.resumeModel.create({
      email: userInfo.email,
      userId: userInfo._id,
      ...createResumeDto,
      status: "Pending",
      history: [
        {
          status: "Pending",
          updatedAt: new Date,
          updatedBy: {
            _id: userInfo._id,
            email: userInfo.email
          }
        }
      ],
      createdBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
    return {
      _id: resumeData._id,
      createdAt: resumeData.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, projection, sort, population } = aqp(queryString);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
      throw new BadRequestException('not found resume !')
    }
    return await this.resumeModel.findById(id)
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, userInfo: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resume !')
    }
    return await this.resumeModel.findByIdAndUpdate(id, {
      status: updateResumeDto.status,
      updatedBy: {
        _id: userInfo._id,
        email: userInfo.email
      },
      $push: {
        history: {
          status: updateResumeDto.status,
          updatedAt: new Date,
          updatedBy: {
            _id: userInfo._id,
            email: userInfo.email
          }
        }
      },
    })
  }

  async remove(id: string, userInfo: IUser) {
    await this.resumeModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    });
    return this.resumeModel.softDelete({ _id: id })
  }

  findByUser = async (userInfo: IUser) => {
    return await this.resumeModel.find({ userId: userInfo._id })
      .sort("-createdAt") // sắp xếp theo ngày gần nhất
      .populate([
        {
          path: "companyId", select: { name: 1 } // lấy thêm name ở trường companyId
        },
        {
          path: "jobId", select: { name: 1 } // lấy thêm name ở trường jobId
        }
      ])
  }

}
