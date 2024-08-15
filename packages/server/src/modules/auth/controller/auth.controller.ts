import { Controller, Get, Post, UseGuards, Req, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
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
    try {
      const user = (req as any).user;
      if (!user) {
        throw new HttpException('No user from Google', HttpStatus.BAD_REQUEST);
      }
      const { access_token } = await this.authService.googleLogin(user);
      console.log('access_token', access_token);
      
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}/google/callback?token=${access_token}`;
      console.log('Redirecting to:', redirectUrl);
      res.status(302).redirect(redirectUrl);
    } catch (error) {
        console.error('Google Auth Error:', error);
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const errorUrl = `${frontendUrl}/google/error?message=${encodeURIComponent(error.message)}`;
        
        res.status(302).redirect(errorUrl);
    }
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