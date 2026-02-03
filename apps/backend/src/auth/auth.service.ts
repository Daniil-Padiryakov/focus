import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/user.service';
import { SignupDto } from '@/auth/dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  private readonly saltRounds = 12;

  async getPasswordHash(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async signup(dto: SignupDto) {
    const { email, password } = dto;

    const passwordHash = await this.getPasswordHash(password);

    const user = await this.userService.createUser({ email, passwordHash });

    return { user };
  }
}
