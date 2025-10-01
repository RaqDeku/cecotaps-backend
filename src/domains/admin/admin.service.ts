import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, EntityManager, MoreThan, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth.credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomBytes } from 'crypto';
import { VerifyEmailEvent } from 'src/events/verify.email.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Tokens } from './entities/verification.tokens.entity';
import { VerifyTokenDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/email.verification.dto';
import { AuthTypes } from './constants';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Tokens)
    private tokenRepository: Repository<Tokens>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async registerAdmin(creds: AuthCredentialsDto) {
    const { email, password, name } = creds;

    // const adminExists = await this.adminRepository.findOneBy({});
    // if (adminExists) {
    //   throw new BadRequestException('Admin already exists, proceed to login');
    // }

    await this.dataSource.transaction(async (manager) => {
      const admin = manager.getRepository(Admin).create({
        email,
        name,
        password: await this.hashPassword(password),
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      });

      await manager.getRepository(Admin).save(admin);

      const { token, hashedToken } = await this.createVerificationToken({
        email,
        user_id: admin.id,
      });

      const verificationToken = manager.getRepository(Tokens).create({
        token: hashedToken,
        type: AuthTypes.EMAIL_VERIFICATION,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
        user_id: admin.id,
      });

      await manager.getRepository(Tokens).save(verificationToken);

      await this.sendVerificationEmail(
        email,
        token,
        AuthTypes.EMAIL_VERIFICATION,
      );
    });

    return 'Verification email sent!';
  }

  async loginAdmin(creds: AuthCredentialsDto) {
    const { email, password } = creds;
    const admin = await this.adminRepository.findOne({ where: { email } });

    if (!admin) {
      throw new BadRequestException('Invalid credentials');
    }

    // if (!admin.is_email_verified) {
    //   throw new BadRequestException('Kindly verify your email to proceed');
    // }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    try {
      const payload = { email: admin.email, role: admin.role };
      return {
        cookie_value: await this.generateCookie(admin.email),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '5h',
        }),
        user: {
          access_token: await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
          }),
          email: admin.email,
          role: admin.role,
          name: admin.name,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getNewAccessToken(refreshToken: string, cookie: string) {
    let payload: { email: string; role: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new ForbiddenException();
    }

    if (!this.validateCookie(payload.email, cookie)) {
      throw new ForbiddenException();
    }

    const newAccessToken = await this.jwtService.signAsync(
      {
        email: payload.email,
        role: payload.role,
      },
      {
        expiresIn: '15m',
      },
    );

    return {
      access_token: newAccessToken,
    };
  }

  async verifyEmailLinks(verifyTokenDto: VerifyTokenDto) {
    const { isValid, token } =
      await this.isVerificationTokenValid(verifyTokenDto);

    if (!isValid || !token) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    switch (verifyTokenDto.type) {
      case AuthTypes.EMAIL_VERIFICATION:
        return this.verifyRegistrationEmailLink(token);
      case AuthTypes.RESET_PASSWORD:
        return this.verifyPasswordResetLink(token);

      default:
        return { isValid: false, type: null };
    }
  }

  async resendVerificationEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, type = AuthTypes.EMAIL_VERIFICATION } = verifyEmailDto;

    const user = await this.adminRepository.findOne({
      where: {
        email: email,
        is_email_verified: false,
      },
    });

    if (!user) {
      return 'Email Sent';
    }

    const existingToken = await this.tokenRepository.findOne({
      where: {
        type,
        user_id: user.id,
        is_used: false,
      },
    });

    if (!existingToken) {
      return 'Email Sent';
    }

    const { token, hashedToken } = await this.createVerificationToken({
      email,
      user_id: user.id,
    });

    await this.tokenRepository.update(
      { id: existingToken.id },
      {
        token: hashedToken,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
        type,
      },
    );

    await this.sendVerificationEmail(email, token, type);

    return 'Email Sent';
  }

  async requestResetPasswordLink() {
    const user = await this.adminRepository.findOneBy({});

    if (!user) {
      return 'A reset password link has been sent';
    }

    const { token, hashedToken } = await this.createVerificationToken({
      email: user.email,
    });

    await this.tokenRepository.update(
      { type: AuthTypes.RESET_PASSWORD, is_used: false, user_id: user?.id },
      { is_used: true, is_verified: true },
    );

    const newToken = this.tokenRepository.create({
      token: hashedToken,
      type: AuthTypes.RESET_PASSWORD,
      user_id: user.id,
      is_used: false,
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    await this.tokenRepository.save(newToken);

    await this.sendVerificationEmail(
      user.email,
      token,
      AuthTypes.RESET_PASSWORD,
    );

    return 'A reset password link has been sent';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const passwordVerificationToken = await this.tokenRepository.findOne({
      where: {
        type: AuthTypes.RESET_PASSWORD,
        is_used: false,
        is_verified: true,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!passwordVerificationToken) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    if (!(await bcrypt.compare(token, passwordVerificationToken.token))) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const user = await this.adminRepository.findOneBy({
      id: passwordVerificationToken.user_id,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Admin)
        .update({ id: user?.id }, { password: hashedPassword });

      await manager
        .getRepository(Tokens)
        .update(
          { id: passwordVerificationToken?.id },
          { is_used: true, is_verified: true },
        );
    });

    return 'Password has been reset successfully';
  }

  async updateAdminProfile() {}

  /**
   * Private methods
   */

  /**
   * @param token Verification Token Instance
   * @returns Whether token is valid and token instance
   */
  private async verifyRegistrationEmailLink(token: Tokens) {
    const admin = await this.adminRepository.findOneBy({ id: token.user_id });

    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Admin)
        .update({ id: admin?.id }, { is_email_verified: true });

      await manager
        .getRepository(Tokens)
        .update({ id: token?.id }, { is_used: true, is_verified: true });
    });

    return { isValid: true, type: AuthTypes.EMAIL_VERIFICATION };
  }

  private async verifyPasswordResetLink(token: Tokens) {
    await this.tokenRepository.update({ id: token?.id }, { is_verified: true });

    return { isValid: true, type: AuthTypes.RESET_PASSWORD };
  }

  private async isVerificationTokenValid(verifyTokenDto: VerifyTokenDto) {
    const { token, type = AuthTypes.EMAIL_VERIFICATION } = verifyTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.EMAIL_JWT_SECRET,
      });

      const user = await this.adminRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        return { isValid: false, token: null };
      }

      const verificationToken = await this.tokenRepository.findOne({
        where: { type, user_id: user.id, is_used: false },
      });

      if (!verificationToken) {
        return { isValid: false, token: null };
      }

      if (!(await bcrypt.compare(token, verificationToken.token))) {
        return { isValid: false, token: null };
      }

      const expiry = new Date(verificationToken.expires_at);
      if (expiry.getTime() < Date.now()) {
        return { isValid: false, token: null };
      }

      return { isValid: true, token: verificationToken };
    } catch (error) {
      console.log(error);

      return { isValid: false, token: null };
    }
  }

  private async createVerificationToken(payload: any) {
    const { email } = payload;

    const token = await this.jwtService.signAsync(
      { email },
      {
        secret: process.env.EMAIL_JWT_SECRET,
        expiresIn: '5m',
      },
    );

    const hashedToken = await this.hashPassword(token);

    return { token, hashedToken };
  }

  private async sendVerificationEmail(
    email: string,
    token: string,
    type: string,
  ) {
    const url = `${process.env.FRONTEND_URL}/auth/verify?token=${token}&type=${type}`;

    const verifyEmailEvent = new VerifyEmailEvent();
    ((verifyEmailEvent.email = email), (verifyEmailEvent.url = url));

    switch (type) {
      case AuthTypes.RESET_PASSWORD:
        this.eventEmitter.emit('reset.password', verifyEmailEvent);
        break;
      case AuthTypes.EMAIL_VERIFICATION:
        this.eventEmitter.emit('verify.email', verifyEmailEvent);
        break;
      default:
        return 'Verification email sent!';
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async generateCookie(value: string): Promise<string> {
    const nonce = randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();

    const data = `${value}:${nonce}:${timestamp}`;

    // Generate HMAC-SHA256
    const hash = createHmac('sha256', process.env.COOKIE_SECRET as string)
      .update(data)
      .digest('hex');

    return `${hash}.${nonce}.${timestamp}`;
  }

  validateCookie(value: string, cookie: string): boolean {
    if (!cookie) {
      return false;
    }

    const [hash, nonce, timestamp] = cookie?.split('.');
    if (!hash || !nonce || !timestamp) {
      return false;
    }

    const currentTime = Date.now();
    // cookie is valid for 5 hours
    if (currentTime - parseInt(timestamp, 10) > 5 * 60 * 60 * 1000) {
      return false;
    }

    const data = `${value}:${nonce}:${timestamp}`;

    const computedHash = createHmac(
      'sha256',
      process.env.COOKIE_SECRET as string,
    )
      .update(data)
      .digest('hex');

    return computedHash === hash;
  }
}
