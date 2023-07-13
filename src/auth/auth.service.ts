import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private roleService: RolesService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValidPassword = this.usersService.checkUserPassword(pass, user.password)
            if (isValidPassword === true) {
                const userRole = user.role as unknown as { _id: string, name: string }
                const roleTemp = await this.roleService.findOne(userRole._id)
                const userData = { ...user.toObject(), permissions: roleTemp?.permissions ?? [] }
                return userData;
            }
        }
        return null;
    }

    async loginService(user: IUser, response: Response) {
        const { _id, name, email, role, permissions } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };

        const refresh_token = this.createRefreshToken(payload)
        // update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id)
        // set refresh token as cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) // ms để chuyển đổi sang mili giây
        })

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }
        };
    }

    async registerService(registerUserInfo: RegisterUserDto) {
        const newUser = await this.usersService.register(registerUserInfo)
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt,
        };
    }

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
        })
        return refreshToken
    }

    refreshTokenService = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            })
            const user = await this.usersService.findUserByToken(refreshToken)
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "refresh token",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };

                const refresh_token = this.createRefreshToken(payload)
                // update user with refresh token
                await this.usersService.updateUserToken(refresh_token, _id.toString())
                // fetch user's role & permission
                const userRole = user.role as unknown as { _id: string, name: string }
                // role này ở db đang ở dạng id, phải chuyển đổi qua { _id: string, name: string }
                const roleTemp = await this.roleService.findOne(userRole._id)
                // set refresh token as cookies
                response.clearCookie('refresh_token')
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) // ms để chuyển đổi sang mili giây
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: roleTemp?.permissions ?? []
                    }
                };
            } else {
                throw new BadRequestException(`Refresh token không hợp lệ !`);
            }
        } catch (error) {
            throw new BadRequestException(`Refresh token không hợp lệ !`);
        }
    }

    logoutService = async (userAuthInfo: IUser, response: Response) => {
        await this.usersService.updateUserToken(null, userAuthInfo._id)
        response.clearCookie('refresh_token')
        return ('ok')
    }
}
