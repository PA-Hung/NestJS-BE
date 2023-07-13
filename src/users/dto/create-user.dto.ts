import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {
    @IsNotEmpty({
        message: 'Name không được để trống !',
    })
    name: string;

    @IsEmail({}, {
        message: 'Email của bạn không đúng !',
    })
    @IsNotEmpty({
        message: 'Email không được để trống !',
    })
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    age: number

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    address: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty()
    @IsMongoId()
    role: mongoose.Schema.Types.ObjectId;
}

export class RegisterUserDto {
    @IsNotEmpty({
        message: 'Name không được để trống !',
    })
    name: string;

    @IsEmail({}, {
        message: 'Email của bạn không đúng !',
    })
    @IsNotEmpty({
        message: 'Email không được để trống !',
    })
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    age: number

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    address: string;

}
