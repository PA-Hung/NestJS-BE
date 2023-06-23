import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateUserDto {
    @IsEmail({}, {
        message: 'Email của bạn không đúng !',
    })
    @IsNotEmpty({
        message: 'Email không được để trống !',
    })
    email: string;

    @IsNotEmpty()
    password: string;

    name: string;
    address: string;
}
