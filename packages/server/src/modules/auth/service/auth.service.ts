import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/service/user.service';
import { LoginDto, RegisterDto } from '../dto';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException();
    }
    let dbUser = await this.userService.findByEmail(user.email);
    if (!dbUser) {
      dbUser = await this.userService.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.email.split('@')[0],
        googleId: user.googleId,
        authType: 'GOOGLE',
      });
    }
    const payload = { email: dbUser.email, sub: dbUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      ...registerDto,
      username: registerDto.email.split('@')[0],
      password: hashedPassword,
      authType: 'EMAIL',
    });
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (user && user.password) { 
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (isPasswordValid) {
            const payload = { email: user.email, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload),
            };
        }
    }
    throw new UnauthorizedException('Invalid credentials');
}

  async validateUser(payload: any): Promise<any> {
    return await this.userService.findById(payload.sub);
  }
}
