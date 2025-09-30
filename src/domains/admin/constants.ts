import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
};

export enum AuthTypes {
  RESET_PASSWORD = 'reset_password',
  EMAIL_VERIFICATION = 'email',
}
