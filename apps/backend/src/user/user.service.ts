import { Inject, Injectable } from '@nestjs/common';
import type { User } from '@focus/shared';
import { CreateUserDto } from '@/user/dto/user.dto';
import { Knex } from 'knex';

interface UsersRow {
  user_id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

@Injectable()
export class UserService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  async createUser(dto: CreateUserDto): Promise<User | null> {
    const userWithSameEmail: User | undefined = await this.knex<UsersRow>(
      'users',
    )
      .where('email', dto.email)
      .first();

    if (userWithSameEmail) return null;

    const [newUser]: User[] = await this.knex('users')
      .insert(dto)
      .returning(['user_id', 'email']);

    return newUser ?? null;
  }
}
