import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionModule } from './domains/regions/region.module';
import { DistrictsModule } from './domains/districts/districts.module';
import { ConflictsModule } from './domains/conflicts/conflict.module';
import { AdminModule } from './domains/admin/admin.module';
import { EmailModule } from './services/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const typeormConfig = configService.get('typeorm');
        if (!typeormConfig) {
          throw new Error('TypeORM configuration is missing');
        }
        return typeormConfig;
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      global: true,
    }),
    RegionModule,
    DistrictsModule,
    ConflictsModule,
    AdminModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
