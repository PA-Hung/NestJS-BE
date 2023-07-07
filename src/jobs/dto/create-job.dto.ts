import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateJobDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    skill: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty()
    salary: number

    @IsNotEmpty()
    quantity: number;

    @IsNotEmpty()
    level: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value)) // convert dữ liệu từ string sang dạng date
    @IsDate()
    startDate: Date

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value)) // convert dữ liệu từ string sang dạng date
    @IsDate()
    endDate: Date

    @IsBoolean()
    isActive: boolean
}
