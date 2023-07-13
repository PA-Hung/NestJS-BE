import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ReqUser, ResponseMessage } from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response as ResCookies, Request as ReqCookies } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private rolesService: RolesService,
    ) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @ResponseMessage('User login !')
    @Post('/login')
    handleLogin(@ReqUser() userAuthInfo: IUser, @Res({ passthrough: true }) response: ResCookies) {
        return this.authService.loginService(userAuthInfo, response)
    }

    @Public()
    @ResponseMessage('Register a new user !')
    @Post('/register')
    handleRegister(@Body() registerUserInfo: RegisterUserDto) {
        return this.authService.registerService(registerUserInfo)
    }

    @ResponseMessage('Get user infomation !')
    @Get('/account')
    async handleAccount(@ReqUser() user: IUser) {
        // vì trong ReqUser không có chứa user permissions nên phải gán thủ công sau khi login
        // ReqUser không có chứa vì không muốn đưa vào payload làm nặng thêm access Token
        const userTemp = await this.rolesService.findOne(user.role._id) as any
        user.permissions = userTemp.permissions
        return { user }
    }

    @Public()
    @ResponseMessage('Get user refresh token !')
    @Get('/refresh')
    handleRefreshToken(@Req() request: ReqCookies, @Res({ passthrough: true }) response: ResCookies) {
        const refreshToken = request.cookies['refresh_token']
        return this.authService.refreshTokenService(refreshToken, response);
    }

    @ResponseMessage('Logout user !')
    @Post('/logout')
    handleLogout(@ReqUser() userAuthInfo: IUser, @Res({ passthrough: true }) response: ResCookies) {
        return this.authService.logoutService(userAuthInfo, response);
    }

}
