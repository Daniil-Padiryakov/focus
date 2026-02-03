import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from '@/auth/dto/signup.dto';
import { AuthService } from '@/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);

    return { user };
  }

  @Post('login')
  login() {}

  @Post('refresh')
  refresh() {}

  @Post('logout')
  logout() {}
}
