import { IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  type: string;
}
