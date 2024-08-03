import { Controller, Get, Post, UseGuards, Req, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../service/auth.service';
import { LoginDto, RegisterDto } from '../dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,  private configService: ConfigService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
        const user = (req as any).user;
        const { access_token } = await this.authService.googleLogin(user);
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        return res.redirect(302, `${frontendUrl}/auth/callback?token=${access_token}`);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}