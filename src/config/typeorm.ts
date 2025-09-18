import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import fs from 'fs';
import path from 'path';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: +`${process.env.DATABASE_PORT}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  ssl: Boolean(process.env.DATABASE_SSL) && {
    rejectUnauthorized: Boolean(process.env.DATABASE_REJECT_UNAUTHORIZED),
    ca: fs
      .readFileSync(path.resolve(process.cwd(), process.env.DATABASE_SSL_CA!))
      .toString(),
  },
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
  migrationsTableName: 'custom_migration_table',
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
