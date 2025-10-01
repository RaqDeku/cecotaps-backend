import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import { ApiResponse } from 'src/common/api.response';
import express from 'express';
import { Public } from './auth.guard';
import { VerifyTokenDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/email.verification.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Controller('admin')
export class AdminController extends ApiResponse {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @Public()
  @Post('/register')
  async registerAdmin(@Body() creds: AuthCredentialsDto) {
    return this.response({
      message: await this.adminService.registerAdmin(creds),
      data: null,
    });
  }

  @Public()
  @Post('/login')
  async loginAdmin(
    @Body() creds: AuthCredentialsDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { cookie_value, refresh_token, user } =
      await this.adminService.loginAdmin(creds);

    res.cookie('x-refresh', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.cookie('_session', cookie_value, {
      maxAge: 5 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return this.response({
      data: user,
    });
  }

  @Public()
  @Get('/refresh-token')
  async getNewAccessToken(@Req() request: express.Request) {
    const cookie = request.cookies['_session'];
    const refreshCookie = request.cookies['x-refresh'];

    if (!refreshCookie) {
      throw new ForbiddenException();
    }

    return this.response({
      data: await this.adminService.getNewAccessToken(refreshCookie, cookie),
    });
  }

  @Public()
  @Get('/verify-email')
  async verifyEmail(
    @Query() verifyToken: VerifyTokenDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { isValid, type } =
      await this.adminService.verifyEmailLinks(verifyToken);

    if (isValid) {
      return this.response({
        data: { type },
      });
    }

    return this.response({
      message: 'Verification failed',
      data: null,
    });
  }

  @Public()
  @Get('/email-verify')
  async sendVerificationEmail(@Query() verifyEmail: VerifyEmailDto) {
    return this.response({
      message: await this.adminService.resendVerificationEmail(verifyEmail),
      data: undefined,
    });
  }

  @Public()
  @Get('/reset-password')
  async sendPasswordResetVerificationLink() {
    return this.response({
      message: await this.adminService.requestResetPasswordLink(),
      data: null,
    });
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.response({
      message: await this.adminService.resetPassword(resetPassword),
      data: null,
    });
  }
}
