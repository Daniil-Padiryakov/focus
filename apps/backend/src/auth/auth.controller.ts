import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from '@/auth/dto/signup.dto';

@Controller('auth')
export class AuthController {
  @Post('signup')
  signup(@Body() _dto: SignupDto) {
    console.log('signup12345678');
  }

  @Post('login')
  login() {}

  @Post('refresh')
  refresh() {}

  @Post('logout')
  logout() {}
}
