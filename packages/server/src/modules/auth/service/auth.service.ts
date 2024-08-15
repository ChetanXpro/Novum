import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/service/user.service';
import { LoginDto, RegisterDto } from '../dto';


interface GoogleUser {
  id: string;
  email: string;
  displayName: string;
  picture: string;
  isEmailVerified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(googleUser: GoogleUser) {
    if (!googleUser) {
      throw new UnauthorizedException('No user from Google');
    }
    try {
      let dbUser = await this.userService.findByEmail(googleUser.email);
      if (!dbUser) {
        dbUser = await this.userService.create({
          email: googleUser.email,
          name: googleUser.displayName,
          username: googleUser.email.split('@')[0],
          isEmailVerified: googleUser.isEmailVerified,
          googleId: googleUser.id,
          profilePicUrl: googleUser.picture,
          authType: 'GOOGLE',
        });
      } else if (!dbUser.googleId) {
        // Update existing user with Google ID if they're logging in with Google for the first time
        dbUser = await this.userService.update(dbUser.id, { googleId: googleUser.id });
      }
      const payload = { email: dbUser?.email, sub: dbUser?.id };

      
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Google Login Error:', error);
      throw new UnauthorizedException('Failed to process Google login');
    }
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
