import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>
  ) { }

  async create(createPermissionDto: CreatePermissionDto, userInfo: IUser) {
    const check = await this.permissionModel.findOne({
      apiPath: createPermissionDto.apiPath,
      method: createPermissionDto.method
    })
    if (check) {
      throw new BadRequestException(
        `Permission có apiPath=${createPermissionDto.apiPath} & method:${createPermissionDto.method} đã tồn tại !`
      );
    }
    const res = await this.permissionModel.create({
      ...createPermissionDto, createdBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
    return {
      _id: res._id,
      createdAt: res.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, projection, sort, population } = aqp(queryString);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.permissionModel.find(filter)
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
    return await this.permissionModel.findById(id)
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, userInfo: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found pernission !')
    }
    return await this.permissionModel.updateOne({ _id: id }, {
      ...updatePermissionDto,
      updatedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    })
  }

  async remove(id: string, userInfo: IUser) {
    await this.permissionModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: userInfo._id,
        email: userInfo.email
      }
    });
    return this.permissionModel.softDelete({ _id: id })
  }
}
