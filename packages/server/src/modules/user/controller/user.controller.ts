import { Body, Controller, Get, Param, Post, Put, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { UserService } from '../service';
import { CreateUserDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth-guard';
// import { RestrictedGuard } from '../../common';
import { GetUser } from '../../common/decorators';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        return this.userService.findAll(page, limit);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@GetUser() user: any) {
        console.log('user==', user);
        if (user === undefined) {
            throw new NotFoundException('User not found==');
        }
      
        
        const user_record = await this.userService.findById(user.sub);
        if (!user_record) {
            throw new NotFoundException('User not found');
        }
        return user_record;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.userService.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: { username?: string; email?: string }) {
        const user = await this.userService.update(id, updateUserDto);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    @Get(':id/videos')
    async getUserVideos(@Param('id') id: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const videos = await this.userService.getUserVideos(id, page, limit);
        if (!videos) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return videos;
    }
}